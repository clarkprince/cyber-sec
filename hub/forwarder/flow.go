package forwarder

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

type Flow struct {
	Source ulid.ULID
	Sink   ulid.ULID
}

type Sink struct {
	ID     ulid.ULID
	Type   string
	config vectorMarshaler
}

type configCommons struct {
	Inputs []string `json:"inputs"`
}

type vectorMarshaler interface {
	MarshalVector(configCommons) ([]byte, error)
}

var knownSink = map[string]reflect.Type{
	"sink:deleted":     reflect.TypeOf(Deleted{}),
	"sink:s3directory": reflect.TypeOf(S3Directory{}),
	// missing: syslog, splunk
}

func NewSink(oftype string) (Sink, error) {
	cfg, ok := knownSink[oftype]
	if !ok {
		return Sink{}, fmt.Errorf("unknown sink type: %s", oftype)
	}
	return Sink{config: reflect.New(cfg).Interface().(vectorMarshaler), Type: oftype}, nil
}

var _ctap = cbor.CTAP2EncOptions()

type binsink = struct {
	ID     ulid.ULID       `cbor:"1,keyasint"`
	Type   string          `cbor:"22,keyasint"`
	Config cbor.RawMessage `cbor:"23,keyasint"`
}

func (s Sink) MarshalBinary() ([]byte, error) {
	bs := binsink{ID: s.ID, Type: s.Type}
	encoder, _ := _ctap.EncMode()
	msg, err := encoder.Marshal(s.config)
	if err != nil {
		return nil, err
	}
	bs.Config = msg
	return cbor.Marshal(bs)
}

func (s *Sink) UnmarshalBinary(dt []byte) error {
	var bs binsink
	err := cbor.Unmarshal(dt, &bs)
	if err != nil {
		return err
	}
	*s, err = NewSink(bs.Type)
	if err != nil {
		return err
	}
	s.ID = bs.ID
	return cbor.Unmarshal(bs.Config, s.config)
}

type Deleted struct{}

func (d Deleted) MarshalVector(c configCommons) ([]byte, error) {
	vform := struct {
		configCommons
		Type string `json:"type"`
	}{
		configCommons: c,
		Type:          "blackhole", // https://vector.dev/docs/reference/configuration/sinks/blackhole/
	}
	return json.Marshal(vform)
}

type S3Directory struct {
	AccessKeyID     string
	AccessKeySecret string
	Bucket          string
	PrefixKey       string
}

func (d S3Directory) MarshalVector(commons configCommons) ([]byte, error) {
	vform := struct {
		configCommons
		Type string `json:"type"`

		Auth struct {
			AccessKeyID     string `json:"access_key_id"`
			AccessKeySecret string `json:"access_key_secret"`
		} `json:"auth"`
		Bucket    string `json:"bucket"`
		PrefixKey string `json:"key_prefix"`
	}{
		configCommons: commons,
		Type:          "aws_s3", // https://vector.dev/docs/reference/configuration/sinks/aws_s3/

		Bucket: d.Bucket, PrefixKey: d.PrefixKey,
		Auth: struct {
			AccessKeyID     string `json:"access_key_id"`
			AccessKeySecret string `json:"access_key_secret"`
		}{AccessKeyID: d.AccessKeyID, AccessKeySecret: d.AccessKeySecret},
	}

	return json.Marshal(vform)
}

// ObsSinks registers the virtual table over sinks
func ObsSinks(name string, db func() storage.Executor) func(sqlite.SQLITE3) {
	return sqlite.RegisterTable(name, vtSink{db: db})
}

type vtSink struct {
	ID     string `vtab:"sink,hidden"`
	Type   string `vtab:"type"`
	Config string `vtab:"config"`

	db func() storage.Executor `vtab:"-"`
}

var _ sqlite.Updater[vtSink] = vtSink{}

func (s vtSink) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[vtSink] {
	sks := make([]Sink, 30)
	sks, err := storage.ListPath(context.Background(), s.db(), storage.Forwarders_Sinks, sks)
	if err != nil {
		return sqlite.FromError[vtSink](err)
	}

	return sqlite.TransformArray(sks, func(in Sink) vtSink {
		cfg, err := in.config.MarshalVector(configCommons{})
		if err != nil {
			cfg = []byte("<error: " + err.Error() + ">")
		}
		return vtSink{
			ID:     in.ID.String(),
			Type:   in.Type,
			Config: string(cfg),
		}
	})
}

func (s vtSink) Hash64() int64 { return sqlite.HashString(s.ID) }
func (vt vtSink) Update(ctx context.Context, idx int64, value vtSink) error {
	inserts := idx == -1
	delete := !inserts && value.ID == ""
	if delete {
		sk, err := storage.FindOne[Sink](ctx, vt.db(), storage.Forwarders_Sinks, func(s Sink) bool { return sqlite.HashString(s.ID.String()) == idx })
		if err != nil {
			return fmt.Errorf("cannot find value: %w", err)
		}

		sk.config = Deleted{}
		return storage.PutValue(ctx, vt.db(), fmt.Sprint(storage.Forwarders_Sinks, sk.ID), sk)
	}

	var sk Sink
	if inserts {
		var err error
		sk, err = NewSink(value.Type)
		if err != nil {
			return err
		}
		sk.ID = ulid.Make()
	} else {
		var err error
		sk, err = storage.FindOne[Sink](ctx, vt.db(), storage.Forwarders_Sinks, func(s Sink) bool { return sqlite.HashString(s.ID.String()) == idx })
		if err != nil {
			return fmt.Errorf("cannot find value: %w", err)
		}
	}

	if err := json.Unmarshal([]byte(value.Config), &sk.config); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	return storage.PutValue(ctx, vt.db(), fmt.Sprint(storage.Forwarders_Sinks, sk.ID), sk)
}
