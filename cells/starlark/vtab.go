package starlark

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/fxamacker/cbor/v2"
	"go.starlark.net/starlark"
	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/cells/starlark/internal/vtable"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

type Script struct {
	prg *starlark.Program

	script, name, streamType, redirectURL string // two-step call
}

type serde struct {
	Program []byte
	Name    string
}

func (s Script) MarshalBinary() ([]byte, error) {
	var buf bytes.Buffer
	if s.prg == nil {
		return nil, errors.New("no program")
	}
	if err := s.prg.Write(&buf); err != nil {
		return nil, err
	}
	return cbor.Marshal(serde{Program: buf.Bytes(), Name: s.name})
}

func (s *Script) UnmarshalBinary(dt []byte) error {
	var sd serde
	if err := cbor.Unmarshal(dt, &sd); err != nil {
		return err
	}

	prg, err := starlark.CompiledProgram(bytes.NewReader(sd.Program))
	if err != nil {
		return fmt.Errorf("invalid program: %w", err)
	}

	s.name = sd.Name
	s.prg = prg
	return nil
}

func (s *Script) Init(rq *http.Request) {
	s.script = rq.FormValue("script")
	s.name = rq.FormValue("name")
}

func (s *Script) Test(context.Context, iam.Session) error {
	p, err := vtable.Compile(s.name, s.script)
	if err != nil {
		return err
	}

	s.prg = p
	return nil
}

func (s *Script) Streams() []driver.Stream {
	//[TO-DO] add the rest of streams types ("stream:starlark:notion","stream:starlark:slack") and implement the logic for Test and so on as in assets.go
	return []driver.Stream{{Name: s.name, Type: "stream:starlark:program"}}
}

func (s Script) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, path shards.Shard, cs []piql.Pivot) driver.Iter {
	if iam.OAuthRedirectForConnectors {
		var tkSource oauth2.TokenSource
		var ok bool
		if tkSource, ok = ssn.Oauth2Clients[s.streamType]; ok {
			_, err := tkSource.Token()
			switch {
			case iam.IsOauthMarker(err) && len(s.redirectURL) > 0:
				return driver.ErrWrap(iam.NewAuthorizationError(s.redirectURL))
			case err != nil:
				return driver.ErrWrap(err)
			}
		}
	}
	return vtable.Filter(s.prg, ssn, s.streamType)
}
