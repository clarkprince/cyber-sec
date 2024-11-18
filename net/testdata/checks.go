package netwatch

import (
	"context"
	"errors"
	"fmt"
	"net/netip"
	"os/exec"
	"time"

	"github.com/prometheus-community/pro-bing"
	"trout.software/kraken/webapp/internal/sqlite"
)

// PingRoute performs a quick ping check on a given route
func PingRoute(gateway string, global bool) error {
	route := []string{gateway}
	if global {
		route = append(route, "8.8.8.8", "1.1.1.1")
	}

	for _, hop := range route {
		ping, err := probing.NewPinger(hop)
		if err != nil {
			return fmt.Errorf("invalid hop %s: %w", hop, err)
		}

		ping.Count = 3
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		err = ping.RunWithContext(ctx)
		cancel()
		if err != nil {
			return fmt.Errorf("cannot ping hop %s: %w", hop, err)
		}
	}

	return nil
}

var NoLease = errors.New("could not get a DHCP lease")

// DHCheck runs a single attempt of the dhclient tool.
func DHCheck(iface string) error {
	err := exec.Command("/usr/sbin/dhclient", "-i", iface, "-1").Run()
	ee := new(exec.ExitError)
	if errors.As(err, &ee) && ee.ExitCode() == 2 {
		return NoLease
	}

	if err != nil {
		return fmt.Errorf("cannot find dhcp client command: %w", err)
	}

	return nil
}


func DHCPDiscover(iface string) error {
	return exec.Command("/usr/sbin/dhclient", "-i", iface).Run()
}

func AttachIP(ctx context.Context, ctn *sqlite.Connections, iface string, ip netip.Prefix) error {
	res := ctn.Exec(ctx, "select local, prefixlen from net_addresses where link_name = ?")
	for res.Next() {
	}
	if res.Err() != nil {
		return fmt.Errorf("listing existing addresses: %w", res.Err())
	}

	return exec.Command("/usr/sbin/ip", "address", "add", ip.String(), "dev", iface).Run()
}