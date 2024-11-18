package metrics

import (
	"fmt"
	"io"
	"runtime/pprof"
	"runtime/trace"
	"strings"
	"time"
)

// WriteProfile returns the a Go profile information (see [runtime/pprof]).
// The line argument must be formatted as:
//
//	line = name " " [ "text" ] .
func WriteProfile(line string, dst io.Writer) error {
	const (
		protoFormat = 0
		textFormat  = 2
	)
	outfmt := protoFormat

	parts := strings.Split(line, " ")
	switch len(parts) {
	default:
		return fmt.Errorf("invalid line format %s: want name [ \"text\" ]", line)
	case 2:
		if parts[1] != "text" {
			return fmt.Errorf("invalid format %s: want \"text\"", parts[1])
		}
		outfmt = textFormat
		// fallthrough
	case 1:
		// fallthrough
	}

	p := pprof.Lookup(parts[0])
	if p == nil {
		return fmt.Errorf("unknown profile %s.\nKnown profiles: %s", parts[0], strings.Join(fmap(pprof.Profiles(), func(p *pprof.Profile) string { return p.Name() }), ", "))
	}
	return p.WriteTo(dst, outfmt)
}

func fmap[T, U any](v []T, f func(T) U) []U {
	out := make([]U, len(v))
	for i, v := range v {
		out[i] = f(v)
	}
	return out
}

// WriteCPUProfile starts a Go CPU profiling session
// The line argument must be formatted as:
//
//	line = [ duration ] .
func WriteCPUProfile(line string, dst io.Writer) error {
	dur := 30 * time.Second
	if len(line) > 0 {
		var err error
		dur, err = time.ParseDuration(line)
		if err != nil {
			return err
		}
	}

	if err := pprof.StartCPUProfile(dst); err != nil {
		return err
	}

	<-time.After(dur)
	pprof.StopCPUProfile()
	return nil
}

// WriteCPUProfile starts a Go tracing session (see [runtime/trace]).
// The line argument must be formatted as:
//
//	line = [ duration ] .
func WriteTrace(line string, dst io.Writer) error {
	dur := 30 * time.Second
	if len(line) > 0 {
		var err error
		dur, err = time.ParseDuration(line)
		if err != nil {
			return err
		}
	}

	if err := trace.Start(dst); err != nil {
		return err
	}

	<-time.After(dur)
	trace.Stop()
	return nil
}
