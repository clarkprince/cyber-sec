package tasks

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTaskFromRequest(t *testing.T) {
	cases := []struct {
		rq   *http.Request
		name string
	}{
		{httptest.NewRequest("GET", "/", nil), "/"},
		{httptest.NewRequest("GET", "/path", nil), "/path"},
		{httptest.NewRequest("GET", "/p1/p2", nil), "/p1/p2"},
		{httptest.NewRequest("GET", "/p1/p2/p3", nil), "/p1/p2/p3"},
		{httptest.NewRequest("GET", "/login", nil), "/login"},
	}

	for _, c := range cases {
		_, tsk := FromRequest(c.rq)
		if tsk.name != "hub:"+c.name {
			t.Errorf("FromRequest(%s): want name=%s got name=%s", c.rq.URL.Path, "hub:"+c.name, tsk.name)
		}
	}
}
