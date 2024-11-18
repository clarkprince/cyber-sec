package netwatch

import "time"

type Port struct {
	IFace string

	Status string
}

type RetryError struct {
	RetryIn time.Duration
	Err error
}

func (p *Port) SetStatus(st string) {}
