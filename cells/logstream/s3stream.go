package logstream

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	types "github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/cells/logstream/internal/iter"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

// S3Stream provides configuration to access files located on S3.
type S3Stream struct {
	Role         string `form:"role,required,placeholder=arn:aws:iam::123456789:role/app-access"` // ARN of the
	Path         s3Path `form:"bucket,required,pattern=arn:aws:s3:::[a-z0-9\\.\\-]+\\/.*,placeholder=arn:aws:s3:::mybucket/my-applog-.*"`
	Region       string `form:"region,required,placeholder=us-east-2"`
	Preprocessor string `form:"preprocessor,placeholder=gunzip"`
	err          error

	Pattern, Bucket string // backward compatibility
}

type s3Path struct {
	Bucket  string // ARN of the
	Pattern string // find only matching this
}

// no other role than marking the code below for deletion
var portOlderRecords = features.HasFlag("portS3records")

func (st *S3Stream) UnmarshalBinary(dt []byte) error {
	type Proxy S3Stream
	var p Proxy
	if err := cbor.Unmarshal(dt, &p); err != nil {
		return err
	}

	if p.Pattern != "" {
		p.Path.Pattern = p.Pattern
	}
	if p.Bucket != "" {
		p.Path.Bucket = p.Bucket
	}
	*st = S3Stream(p)
	return nil
}

func (p s3Path) String() string {
	if p.Bucket == "" && p.Pattern == "" {
		return ""
	}
	return fmt.Sprint(p.Bucket, "/", p.Pattern)
}

var (
	_ driver.HTTPConfigurable = &S3Stream{}
	_ iter.Connecter          = &S3Stream{}
	_ shards.Sharded          = &S3Stream{}
	_ driver.Selectable       = &S3Stream{}
)

// connection to s3 requires at minimum an ARN
// method used to connect is AssumeRoleWithWebIdentity
// AssumeRoleWithWebIdentity allows users to OAuth token to get temporary credentials
func (d *S3Stream) Init(r *http.Request) {
	d.Role = r.PostFormValue("role")
	d.Region = r.PostFormValue("region")
	d.Preprocessor = r.PostFormValue("preprocessor")

	bkt := r.PostFormValue("bucket")
	eob := len(bkt)
	for i := range bkt {
		if bkt[i] == '/' {
			eob = i
			break
		}
	}
	d.Path.Bucket = bkt[:eob]
	if eob < len(bkt)-1 {
		d.Path.Pattern = bkt[eob+1:]
	}
}

func (d *S3Stream) Test(ctx context.Context, ssn iam.Session) error {
	if d.err != nil {
		return d.err
	}
	pattern, err := shards.CompileWithWildcards(d.Path.Pattern)
	if err != nil {
		return err
	}
	pf := pattern
	if strings.ContainsAny(pattern, `*?[`) {
		pf = pattern[:strings.IndexAny(pattern, `*?[`)]
	}
	creds := iam.WebIdentityCredentialsProvider{Role: d.Role, Region: d.Region, Session: &ssn}
	cfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithCredentialsProvider(creds),
		config.WithRegion(d.Region))
	if err != nil {
		return err
	}
	tasks.Annotate(ctx, "bucket", shortARN(d.Path.Bucket))

	_, err = s3.NewFromConfig(cfg).ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket:  aws.String(shortARN(d.Path.Bucket)),
		MaxKeys: 1,
		Prefix:  aws.String(pf)})
	return err
}
func (d S3Stream) ShardPattern() string { return d.Path.Pattern }
func (d *S3Stream) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Logs", Type: "stream:logstream:blob-s3"}}
}

func (d *S3Stream) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, path shards.Shard, cs []piql.Pivot) driver.Iter {
	return iter.Filter(d, ssn, st, g, path, cs)
}

func (d *S3Stream) Connect(ssn *iam.Session) (iter.Driver, error) {
	creds := iam.WebIdentityCredentialsProvider{Role: d.Role, Region: d.Region, Session: ssn}
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithCredentialsProvider(creds), config.WithRegion(d.Region))
	if err != nil {
		return nil, err
	}

	return S3Client{cfg: d, client: s3.NewFromConfig(cfg), Preprocessor: d.Preprocessor}, nil
}

type S3Client struct {
	client *s3.Client
	cfg    *S3Stream

	Preprocessor string
}

func (c S3Client) Glob(pattern string) ([]string, error) {
	ctx, task := tasks.New(context.Background(), "cell:s3_glob_objects")
	defer task.End()

	var pf string
	var err error
	magicChars := `*?[`
	if strings.ContainsAny(pattern, magicChars) {
		pf = pattern[:strings.IndexAny(pattern, magicChars)]
	}

	lo, err := getAll(ctx, c.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(shortARN(c.cfg.Path.Bucket)),
		Prefix: aws.String(pf)})
	if err != nil {
		return nil, err
	}
	names := make([]string, len(lo))
	i := 0
	for _, o := range lo {
		match, err := path.Match(pattern, *o.Key)
		if err != nil {
			return nil, err
		}

		if o.Size == 0 || !match {
			continue
		}
		names[i] = *o.Key
		i++
	}
	return names[:i], nil
}

func getAll(ctx context.Context, client *s3.Client, input *s3.ListObjectsV2Input) ([]types.Object, error) {
	more := true
	var tk string
	var obj []types.Object
	for more {
		if len(tk) > 0 {
			input.ContinuationToken = aws.String(tk)
		}
		lo, err := client.ListObjectsV2(ctx, input)
		if err != nil {
			return obj, err
		}
		obj = append(obj, lo.Contents...)
		more = lo.IsTruncated
		if more && lo.ContinuationToken != nil {
			// continuation token should be set, but better that than crashing
			tk = *lo.ContinuationToken
		}
	}

	return obj, nil
}

func (c S3Client) Open(segment string) (iter.SizedReaderAt, error) {
	ctx, task := tasks.New(context.Background(), "cell:s3_download_objects")
	defer task.End()

	// for now, copy the whole thing locally
	dst, err := os.CreateTemp("", "s3_")

	out, err := c.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(shortARN(c.cfg.Path.Bucket)),
		Key:    aws.String(segment),
	})
	if err != nil {
		return nil, err
	}

	_, err = io.Copy(dst, out.Body)
	if err != nil {
		return nil, err
	}

	var rdr iter.SizedReaderAt = (*LocalFile)(dst)
	if c.Preprocessor != "" {
		rdr, err = gord(c.Preprocessor).pipe(rdr)
		if err != nil {
			return nil, err
		}
	}
	return rdr, nil
}

// oh, AWS, I so hate your stupid APIs
func shortARN(arn string) string {
	idx := strings.LastIndex(arn, ":")
	if idx == -1 {
		return arn
	}
	return arn[idx+1:]
}
