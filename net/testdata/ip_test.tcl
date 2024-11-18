package require Tcl   8.5

source ip.tcl
source tester.tcl

test parse_ip {
	foreach { fmt ll } {
		10.0.0.1/16 { 10.0.0.1 16 }
		172.31.0.1/12 { 172.31.0.1 12 }
	} {
		set v [ ip::parse_address $fmt ]
		if { ! [string equal [dict get $v addr] [lindex $ll 0]] } { error "invalid address [dict get $v addr], want [lindex $ll 0]"}
		if { ! [string equal [dict get $v mask] [lindex $ll 1]] } { error "invalid address [dict get $v addr], want [lindex $ll 1]"}
	}
}

test range_ip {
	# https://account.arin.net/public/cidrCalculator can be used as a reference
	foreach { ip range } {
		10.100.0.0/13 "10.96.0.0-10.103.255.255"
		169.254.0.0/15 "169.254.0.0-169.255.255.255"
		169.254.0.0/16 "169.254.0.0-169.254.255.255"
		169.254.0.0/17 "169.254.0.0-169.254.127.255"
		172.16.0.0/12 "172.16.0.0-172.31.255.255"
	} {
		if {! [string equal $range [ip::range $ip]] } { error "invalid range [ip::range $ip], want $range"}
	}
}

report