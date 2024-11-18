# IP manipulation

package require Tcl   8.5
namespace eval ip {}

# parse_address parses an IP formatted as value/mask
# it returns a dict with two elements addr and mask
proc ip::parse_address {a} {
	set parts [split $a "/"]
	if {[llength $parts] != 2} { error "invalid address $a" }

	dict set ip addr [lindex $parts 0] 
	dict set ip mask [lindex $parts 1]
	return $ip
}

# masked produces the range of possible IPs given a prexfix
proc ip::range {a} {
	set parts [split $a "/"]
	if {[llength $parts] != 2} { error "invalid address $a" }

	# pre-computed table makes the math easier to parse
	set _masks_right { 0 128 192 224 240 248 252 254 255 }
	set _masks_left { 255 127 63 31 15 7 3 1 0 }
	

	set start {}
	set end {}
	
	for {
		set addr [split [lindex $parts 0] "."]
		set mask [lindex $parts 1]
		set i 0
	 } { $i < 4 } {
	 	incr i
	 	set mask [expr $mask > 8 ? $mask - 8 : 0]
	 } {
	 	set v [lindex $addr $i]
	 	if { $mask >= 8 } {
	 		lappend start $v
	 		lappend end $v
	 	} else {
	 		set low [expr $v & [lindex $_masks_right $mask]]
	 		lappend start $low
	 		lappend end  [expr $low | [lindex $_masks_left $mask]]
	 	}
	}

	return "[join $start "."]-[join $end "."]"
}
