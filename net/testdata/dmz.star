# DMZ - demilitarized zone
#   This zone is “outside” of the safe network
#

# Notes: make sure we got reproducible execution (great)
#        make a state machine by the state global variable
#        get arguments from users

port = ports(current=True)

def nat_ports(origin, dest):
	"create port forwarding and nat between origin and dest"

	nft.chain(name="incoming-dmz", hook="input", policy=DENY).add_rules(
		# cannot get oif in mangling table, so marking packets instead
		"iif {iif} oif {oif} meta mark set {mark} accept ".format(iif=origin, oif=dest, mark=0xff),
		"iif {iif} ct state { established, related } accept".format(iif=dest),
	)

	nft.chain(name="forward-dmz", hook="forward", policy=DENY).add_rules(
		"mark {mark} accept".format(mark=0xff)
	)

	nft.chain(name="mangle-dmz", hook="postrouting", policy=ACCEPT).add_rules(
		"mark {mark} mangle".format(mark=0xff))

enable_ipv4_forwarding()

for mtr in ports(profile="mtr"):
	nat_ports(mtr, port)

savepoint("configuring link")
link_up(port)
dhcp_up(port)
release("configuring link")

dhcp_check(port, "configuring link")
ping_watch("8.8.8.8", "configuring link")