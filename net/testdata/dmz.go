package netwatch

import (
	"fmt"
	"net/netip"
)

type DMZProfile struct {
	*Port

	DHCP     bool         // retrieve static IP through DHCP
	StaticIP netip.Prefix // prefix does not zero the
	Scope    string
	MTU      int
}

func (dmz *DMZProfile) Start() error {
	// step if link is up, but that is probably a port-level action

stm:
	switch dmz.Status {
	case "link-up":
		if dmz.DHCP {
			dmz.SetStatus("dhcp-conf")
			if err := DHCPDiscover(dmz.IFace); err != nil {
				// currently, no retry: dhclient does not return with timeout
				// but do we need to block main loop?
				// cf man(5) dhclient.conf
				return fmt.Errorf("cannot get DHCP address: %w", err)
			} 
			dmz.SetStatus("dhcp-down")
			goto stm
		} else {
			AddIP(dmz.IFace, dmz.StaticIP)
		}
	}

	return nil
}
