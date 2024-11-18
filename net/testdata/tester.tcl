package require Tcl 8.6

namespace eval tester_internal {
	variable fails {}
}

proc test {name fun} {
	if {[catch $fun msg]} {
		set tester_internal::fails  [lappend tester_internal::fails "failure executing test $name: $msg"] 
	}
}

proc report {} {
	foreach err $tester_internal::fails { puts stderr $err }
	if { [llength $tester_internal::fails] > 0 } {
		exit 1
	}
}