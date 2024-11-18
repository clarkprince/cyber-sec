package syslog

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"

	"golang.org/x/sys/unix"
	"trout.software/kraken/webapp/internal/metrics"
)

var _messages_counter = metrics.NewRRCounter("syslog/messages")

// TODO close this when program shuts down
func listenSocket(name string, mux *buffer) {
	lst, err := net.Listen("unix", name)
	if err != nil {
		_logger.Error(fmt.Sprintf("cannot connect to %s: %s", name, err))
		return
	}
	defer lst.Close()
	defer mux.close()

	for {
		sk, err := lst.Accept()
		if err != nil {
			_logger.Error("accept error: " + err.Error())
			continue
		}

		buf := make([]byte, 4096) // rfc5424, §6.1

		for {
			sz, err := sk.Read(buf)
			// TODO(rdo) do we expect EOF from vector?
			if err != nil {
				_logger.Error("socket read error: " + err.Error())
				break
			}
			_messages_counter.Inc()
			mux.append(string(buf[:sz]))
		}
	}
}

type process interface {
	Status() int
	Reload(cfg []byte) error
	Stop()
}

const statusok = 0

type subprocess struct {
	p  *exec.Cmd
	fd *os.File
}

func (s *subprocess) Stop() { s.p.Process.Signal(unix.SIGINT) }

func (s subprocess) Status() int { return statusok }

func (s *subprocess) Reload(cfg []byte) error {
	if s.p != nil {
		if _, err := s.fd.Seek(0, io.SeekStart); err != nil {
			return fmt.Errorf("cannot rewind conf file: %w", err)
		}

		if _, err := io.Copy(s.fd, bytes.NewReader(cfg)); err != nil {
			return fmt.Errorf("cannot write config: %w", err)
		}

		if err := s.p.Process.Signal(unix.SIGHUP); err != nil {
			return fmt.Errorf("cannot reload process: %w", err)
		}

		return nil
	}

	fd, err := os.CreateTemp("", "syslog_*.json")
	if err != nil {
		return fmt.Errorf("cannot create file descriptor: %w", err)
	}

	if _, err := io.Copy(fd, bytes.NewReader(cfg)); err != nil {
		return fmt.Errorf("cannot write config: %w", err)
	}

	p := exec.Command("vector", "--config-json", fd.Name())
	p.Stderr = os.Stderr
	p.Stdout = os.Stderr

	if err := p.Start(); err != nil {
		return fmt.Errorf("cannot start subprocess:%w", err)
	}

	s.p = p
	s.fd = fd
	return nil
}
