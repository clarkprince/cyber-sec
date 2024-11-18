package iam

import (
	"fmt"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestGet(t *testing.T) {
	t.Run("stringcache", func(t *testing.T) {
		lru := lru[string](0)

		lru.Add("hello", 1234)
		lru.Add("world", 1234)

		if got, ok := lru.Get("hello"); !ok || got != 1234 {
			t.Errorf("Get(hello): got=%v", got)
		}
	})

	t.Run("structcache", func(t *testing.T) {
		type simpleStruct struct {
			int
			string
		}

		lru := lru[simpleStruct](0)
		lru.Add(simpleStruct{12, "hello"}, "world")

		if got, ok := lru.Get(simpleStruct{12, "hello"}); !ok && got != "world" {
			t.Errorf("get simple struct: got=%v", got)
		}
	})
}

func TestRemove(t *testing.T) {
	lru := lru[string](0)
	lru.Add("myKey", 1234)
	if val, ok := lru.Get("myKey"); !ok {
		t.Fatal("TestRemove returned no match")
	} else if val != 1234 {
		t.Fatalf("TestRemove failed.  Expected %d, got %v", 1234, val)
	}

	lru.Remove("myKey")
	if _, ok := lru.Get("myKey"); ok {
		t.Fatal("TestRemove returned a removed entry")
	}
}

func TestEvict(t *testing.T) {
	evictedKeys := make([]string, 0)
	onEvictedFun := func(key string, value interface{}) {
		evictedKeys = append(evictedKeys, key)
	}

	lru := lru[string](20)
	lru.OnEvicted = onEvictedFun
	for i := 0; i < 22; i++ {
		lru.Add(fmt.Sprintf("myKey%d", i), 1234)
	}

	want := []string{"myKey0", "myKey1"}
	if !cmp.Equal(want, evictedKeys) {
		t.Errorf("invalid evict: diff=%s", cmp.Diff(want, evictedKeys))
	}
}
