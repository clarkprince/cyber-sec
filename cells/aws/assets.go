package aws

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/configservice"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

type Assets struct {
	RoleArn string `form:"role,required,placeholder=arn:aws:iam::123456789:role/app-access"`
	Region  string `form:"region,required,placeholder=us-east-2"`
}

func (s *Assets) Init(r *http.Request) {
	s.RoleArn = r.FormValue("role")
	s.Region = r.FormValue("region")
}

var streamAssets []driver.Stream

func init() {
	streamAssets = make([]driver.Stream, len(_allAssets))
	for i, v := range _allAssets {
		streamAssets[i] = driver.Stream{Name: strings.TrimPrefix(v, "AWS::"), Type: "stream:aws-assets:" + v}
	}
}

func (s *Assets) Test(ctx context.Context, ssn iam.Session) error {
	// TODO(rdo) checks we should be doing:
	// 1. AWS Config has the right set-up (including taking conf snapshots)
	// 2. Permissions are correctly set-up for the user
	return nil
}

func (d Assets) Streams() (streams []driver.Stream) { return streamAssets }

func (aws Assets) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, path shards.Shard, cs []piql.Pivot) driver.Iter {
	ctx, task := tasks.New(context.Background(), "query-resource")
	defer task.End()

	resource := strings.TrimPrefix(st.Type, "stream:aws-assets:")
	if !IsAllowedAsset(resource) {
		return driver.ErrWrap(fmt.Errorf("invalid asset %s", resource))
	}

	tasks.Annotate(ctx, "region", aws.Region)
	tasks.Annotate(ctx, "arn", aws.RoleArn)
	creds := iam.WebIdentityCredentialsProvider{Role: aws.RoleArn, Region: aws.Region, Session: ssn}

	client := configservice.New(configservice.Options{Region: aws.Region, Credentials: creds})

	xp := fmt.Sprintf("SELECT *, configuration WHERE resourceType = '%s'", resource)
	rsp, err := client.SelectResourceConfig(context.Background(), &configservice.SelectResourceConfigInput{
		Expression: &xp})
	if err != nil {
		return driver.ErrWrap(err)
	}

	results := make([]mdt.Record, len(rsp.Results))
	for i, v := range rsp.Results {
		results[i] = *(BuildRecordFromJSON(v))
	}

	return driver.IterateArray(results)
}
