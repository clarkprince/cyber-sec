package iam

import (
	"testing"

	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/tasks"
)

func TestDefaultPolicy(t *testing.T) {
	pdoc, err := ParsePolicy(DefaultPolicy, true)
	if err != nil {
		t.Fatal("cannot parse built-in default policy", err)
	}

	cases := []struct {
		User, Resource msg.Label
		Action         Action
		ShouldAccess   bool
	}{
		{UserLabel, ResourceLabel, PermPlaybookCreate, true},
		{UserLabel, ResourceLabel, PermAdminCreateUser, false},
		{AdminLabel, ResourceLabel, PermAdminCreateUser, true},
	}

	for _, c := range cases {
		err := checkAccess(pdoc, c.Action, c.User, c.Resource)
		switch {
		case err == nil && !c.ShouldAccess:
			t.Errorf("check access allowed %s to (%s, %s)", c.Action, c.User, c.Resource)
		case err != nil && c.ShouldAccess:
			t.Errorf("check access denied %s to (%s, %s)", c.Action, c.User, c.Resource)
		}
	}
}

func ExampleSession_CheckAccess() {
	var ssn *Session // this is the second parameter to most HTTP calls
	if err := ssn.CheckAccess(PermPolicyCreate, ResourceLabel); err != nil {
		tasks.AuditLogger.Info("access denied: create a policy", "user", ssn.UserName)
	}
}
