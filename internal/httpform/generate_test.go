package httpform_test

import (
	"fmt"
	"testing"

	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/internal/httpform"
)

func TestGenerateForm(t *testing.T) {
	cases := []struct {
		spec any
		want []httpform.Field
	}{
		{
			spec: struct {
				PubKey []byte `form:"pubKey,required,placeholder=ssh-ed25519"`
			}{},
			want: []httpform.Field{
				{Name: "pubKey", Placeholder: "ssh-ed25519", Required: true},
			},
		},
		{
			spec: struct {
				Bucket string `form:"bucket,pattern=arn:aws:s3:::[a-z0-9\\.\\-]+\\/.*,placeholder=\"arn:aws:s3:::mybucket"`
				Region string `form:"region"`
				Other  int
			}{},
			want: []httpform.Field{
				{Name: "bucket", Pattern: "arn:aws:s3:::[a-z0-9\\.\\-]+\\/.*", Placeholder: `"arn:aws:s3:::mybucket`},
				{Name: "region"},
			},
		},
	}

	for i, tc := range cases {
		t.Run(fmt.Sprint("case ", i), func(t *testing.T) {
			if got := httpform.GenerateDefinition(tc.spec); !cmp.Equal(got, tc.want) {
				t.Error(cmp.Diff(got, tc.want))
			}
		})
	}
}
