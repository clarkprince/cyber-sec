package net

import (
	"context"
	"errors"
	"fmt"
	"time"

	probing "github.com/prometheus-community/pro-bing"
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

// DHCheck check if we have a DHCP lease
func DHCheck(iface string) error {
	panic("not implemented")
}
