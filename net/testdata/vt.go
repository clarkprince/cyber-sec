package netwatch

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"

	"trout.software/kraken/webapp/internal/sqlite"
)

var (
	Interfaces = sqlite.RegisterTable("net_interfaces", vtIface{})
	Statistics = sqlite.RegisterTable("net_stats", vtStats{})
	Addresses  = sqlite.RegisterTable("net_addresses", vtAddress{})
)

type netiface struct {
	Index     int          `json:"ifindex"`
	Name      string       `json:"ifname"`
	Flags     []string     `json:"flags"`
	MTU       int          `json:"mtu"`
	QDisc     string       `json:"qdisc"`
	State     string       `json:"operstate"`
	Group     string       `json:"group"`
	TxQLen    int          `json:"txqlen"`
	LinkType  string       `json:"link_type"`
	LinkMode  string       `json:"link_mode"`
	Address   string       `json:"address"`
	Broadcast string       `json:"broadcast"`
	Addresses []netaddress `json:"addr_info"`
	Stats     struct {
		Rx netstat `json:"rx"`
		Tx netstat `json:"tx"`
	} `json:"stats64"`
}

type netaddress struct {
	Family           string `json:"family"`
	Local            string `json:"local"`
	PrefixLen        int    `json:"prefixlen"`
	Scope            string `json:"scope"`
	Label            string `json:"label"`
	ValidLifeTime    int    `json:"valid_life_time"`
	PreferedLifeTime int    `json:"preferred_life_time"`
}

type netstat struct {
	Bytes         int `json:"bytes"`
	Packets       int `json:"packets"`
	Errors        int `json:"errors"`
	Dropped       int `json:"dropped"`
	CarrierErrors int `json:"carrier_errors"`
	OverError     int `json:"over_errors"`
	Multicast     int `json:"multicast"`
	Collisions    int `json:"collisions"`
}

type vtIface struct {
	Index     int    `vtab:"index"`
	Name      string `vtab:"name"`
	Flags     string `vtab:"flags"`
	MTU       int    `vtab:"mtu"`
	QDisc     string `vtab:"qdisc"`
	State     string `vtab:"operstate"`
	Group     string `vtab:"group"`
	TxQLen    int    `vtab:"txqlen"`
	LinkType  string `vtab:"link_type"`
	Address   string `vtab:"address"`
	Broadcast string `vtab:"broadcast"`
}

func listInterfaces() ([]netiface, error) {
	data, err := exec.Command("/usr/sbin/ip", "-json", "link").Output()
	if err != nil {
		return nil, fmt.Errorf("cannot list interfaces: %w", err)
	}

	var ifs []netiface
	if err := json.Unmarshal(data, &ifs); err != nil {
		return nil, fmt.Errorf("invalid interface list: %w", err)
	}

	return ifs, nil

}


func (_ vtIface) Filter(int, sqlite.Constraints) sqlite.Iter[vtIface] {
	ifs, err := listInterfaces()
	if err != nil {
		return sqlite.FromError[vtIface](err)
	}
	return sqlite.TransformArray(ifs, func(in netiface) vtIface {
		return vtIface{
			Index:     in.Index,
			Name:      in.Name,
			Flags:     strings.Join(in.Flags, ","),
			MTU:       in.MTU,
			QDisc:     in.QDisc,
			State:     in.State,
			Group:     in.Group,
			TxQLen:    in.TxQLen,
			LinkType:  in.LinkType,
			Address:   in.Address,
			Broadcast: in.Broadcast,
		}
	})
}

type vtAddress struct {
	Index            int    `vtab:"link_index"`
	Name             string `vtab:"link_name"`
	Family           string `vtab:"family"`
	Local            string `vtab:"local"`
	PrefixLen        int    `vtab:"prefixlen"`
	Scope            string `vtab:"scope"`
	Label            string `vtab:"label"`
	ValidLifeTime    int    `vtab:"valid_life_time"`
	PreferedLifeTime int    `vtab:"preferred_life_time"`
}

func listAddress(iface string) ([]netiface, error) {
	data, err := exec.Command("/usr/sbin/ip", "-json", "-s", "address").Output()
	if err != nil {
		return nil, fmt.Errorf("cannot list addresses: %w", err)
	}

	var ifs []netiface
	if err := json.Unmarshal(data, &ifs); err != nil {
		return nil, fmt.Errorf("invalid addresses format: %w", err)
	}

	return ifs, nil
}

func (_ vtAddress) Filter(int, sqlite.Constraints) sqlite.Iter[vtAddress] {
	ifs, err := listAddress()
	if err != nil {
		return sqlite.FromError[vtAddress](err)
	}

	var addr []vtAddress
	for _, nif := range ifs {
		for _, a := range nif.Addresses {
			addr = append(addr, vtAddress{
				Index:            nif.Index,
				Name:             nif.Name,
				Family:           a.Family,
				Local:            a.Local,
				PrefixLen:        a.PrefixLen,
				Scope:            a.Scope,
				Label:            a.Label,
				ValidLifeTime:    a.ValidLifeTime,
				PreferedLifeTime: a.PreferedLifeTime,
			})
		}
	}

	return sqlite.FromArray(addr)
}

type vtStats struct {
	Index         int    `vtab:"link_index"`
	Name          string `vtab:"link_name"`
	RxTx          string `vtab:"rx_tx"`
	Bytes         int    `vtab:"bytes"`
	Packets       int    `vtab:"packets"`
	Errors        int    `vtab:"errors"`
	Dropped       int    `vtab:"dropped"`
	CarrierErrors int    `vtab:"carrier_errors"`
	OverError     int    `vtab:"over_errors"`
	Multicast     int    `vtab:"multicast"`
	Collisions    int    `vtab:"collisions"`
}

func (_ vtStats) Filter(int, sqlite.Constraints) sqlite.Iter[vtStats] {
	data, err := exec.Command("/usr/sbin/ip", "-json", "-s", "address").Output()
	if err != nil {
		return sqlite.FromError[vtStats](err)
	}

	var ifs []netiface
	if err := json.Unmarshal(data, &ifs); err != nil {
		return sqlite.FromError[vtStats](err)
	}

	stats := make([]vtStats, 2*len(ifs))
	for i := 0; i < len(stats); i += 2 {
		nif := ifs[i/2]
		stats[i] = vtStats{
			Index:         nif.Index,
			Name:          nif.Name,
			RxTx:          "rx",
			Bytes:         nif.Stats.Rx.Bytes,
			Packets:       nif.Stats.Rx.Packets,
			Errors:        nif.Stats.Rx.Errors,
			Dropped:       nif.Stats.Rx.Dropped,
			CarrierErrors: nif.Stats.Rx.CarrierErrors,
			OverError:     nif.Stats.Rx.OverError,
			Multicast:     nif.Stats.Rx.Multicast,
			Collisions:    nif.Stats.Rx.Collisions,
		}
		stats[i+1] = vtStats{
			Index:         nif.Index,
			Name:          nif.Name,
			RxTx:          "tx",
			Bytes:         nif.Stats.Tx.Bytes,
			Packets:       nif.Stats.Tx.Packets,
			Errors:        nif.Stats.Tx.Errors,
			Dropped:       nif.Stats.Tx.Dropped,
			CarrierErrors: nif.Stats.Tx.CarrierErrors,
			OverError:     nif.Stats.Tx.OverError,
			Multicast:     nif.Stats.Tx.Multicast,
			Collisions:    nif.Stats.Tx.Collisions,
		}
	}

	return sqlite.FromArray(stats)
}
