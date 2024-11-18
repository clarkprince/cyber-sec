// originally from from stdlib/syslog; but with added trace and control

package devices

import (
	"errors"
	"fmt"
	"net"
	"os"
	"strconv"
)

func unixSyslog() (conn *netConn, err error) {
	logTypes := []string{"unixgram", "unix"}
	logPaths := []string{"/dev/log", "/var/run/syslog", "/var/run/log"}
	for _, network := range logTypes {
		for _, path := range logPaths {
			conn, err := net.Dial(network, path)
			if err == nil {
				return &netConn{conn: conn, local: true}, nil
			}
		}
	}
	return nil, errors.New("Unix syslog delivery error")
}

type netConn struct {
	local bool
	conn  net.Conn
}

func (c netConn) Write(dt []byte) (int, error) { return c.conn.Write(dt) }

var syslog struct {
	unixout   chan *netConn
	listening bool
}

var (
	PID      string
	Hostname string
)

func DialSyslog() error {
	ctn, err := unixSyslog()
	if err != nil {
		return fmt.Errorf("cannot contact local syslog server: %w", err)
	}

	syslog.unixout = make(chan *netConn, 1)
	syslog.unixout <- ctn

	syslog.listening = true

	PID = strconv.Itoa(os.Getpid())
	Hostname, err = os.Hostname()
	if err != nil {
		return fmt.Errorf("cannot read hostname: %w", err)
	}

	return nil
}

const (
	sysInfo = 6

	sysLOCAL0 = 128 + iota
	sysLOCAL1
	sysLOCAL2
	sysLOCAL3
	sysLOCAL4
	sysLOCAL5
	sysLOCAL6
	sysLOCAL7
)
