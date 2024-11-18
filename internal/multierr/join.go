// Package multierr is a pre-port of the new errors types in Go 1.20
package multierr

// Join returns an error that wraps the given errors.
// Any nil error values are discarded.
// Join returns nil if errs contains no non-nil values.
// The error formats as the concatenation of the strings obtained
// by calling the Error method of each element of errs, with a newline
// between each string.
func Join(errs ...error) error {
	n := 0
	for i, err := range errs {
		if err != nil {
			errs[n] = errs[i]
			n++
		}
	}
	if n == 0 {
		return nil
	}
	return E(errs[:n])
}

type E []error

func (e E) Error() string {
	var b []byte
	for i, err := range e {
		if i > 0 {
			b = append(b, '\n')
		}
		b = append(b, err.Error()...)
	}
	return string(b)
}
func (e E) Unwrap() []error {
	return ([]error)(e)
}

// ErrNil is a convenience method returning nil if the underlying array is empty.
func (e E) ErrNil() error {
	if len(e) > 0 {
		return e
	}
	return nil
}

// First returns the first error, or nil if none exists.
func (e E) First() error {
	if len(e) > 0 {
		return e[0]
	}
	return nil
}
