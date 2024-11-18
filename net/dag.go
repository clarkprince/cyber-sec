package net

import "sync"

type step struct {
	action interface {
		Name() string
		Do() int
	}
	next []*step
}

type mchn struct {
	s *step

	mx    sync.Mutex
	state string
}

func (m *mchn) run(s *step) {
	for {
		m.mx.Lock()
		m.s = s
		m.state = s.action.Name()
		m.mx.Unlock()
		s = m.s.next[s.action.Do()]
	}
}
