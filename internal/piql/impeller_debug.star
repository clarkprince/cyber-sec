def command_list_rules_in_index(args):
	"""Prints the linked list of all rules matching a segment in the index

list_rules_in_index <evaluator> <path>
"""
	ev, path = args.split(" ")
	v = eval(None, ev).Variable.Value

	if path == "$.*EOR*":
		path = "$.\x1E\x1E\x1E\x1E"

	p = v["idx"][path]
	while p != None:
		print("rule=%(i)d instr=%(instr)s" % p)
		p = p["n"][0]

def command_list_windows_in_index(args):
	"""Prints the current records stored in window held in memory.

list_windows_in_index <evaluator>
"""
	def sym_win(ts, bounds, ref, unq):
		if ts == bounds[0] or ts == bounds[1]:
			return "+"
		if ref != 0:
			return "|"
		if unq != 0:
			return "/"

	ev = eval(None, args).Variable.Value
	wins = []
	for i in range(len(ev["rules"])):
		ts = [ref["ts"] for ref in ev["win"] if ref["ref"] & 1 << i != 0]
		if len(ts) > 0:
			wins.append((min(ts), max(ts)))
		else:
			wins.append((0, 0))

	for r in ev["win"]:
		pfix = " ".join([sym_win(r["ts"], s, r["ref"] & 1 << i, r["unq"] & 1 << i) for i, s in zip(range(len(wins)), wins)])
		print(pfix, "    ", r["Record"]["origin"])


def command_list_partitions_in_window(args):
	"""Print the partitions stored in a window held in memory.

list_partitions_in_window <evaluator> <rule number>
"""
	ev, rnum = args.split(" ")
	ev = eval(None, ev).Variable.Value
	for w in ev["win"]:
		if w["ref"] & 1 << int(rnum) == 0:
			continue
		off = 0
		for i in range(int(rnum)):
			if w["ref"] & 1 << i != 0:
				off += 1
		print("partition=", w["ptn"][off], "record=", w["Record"]["origin"])

def command_show_excl_bitset(args):
	"""Print the exclusion bitset for each rule.

show_excl_bitset <evaluator>
"""
	ev = eval(None, args).Variable.Value
	for r in ev["rules"]:
		print("%o\n" % r.excl)

def main():
	dlv_command("config alias list_rules_in_index lrules")
	dlv_command("config alias list_windows_in_index lwins")
	dlv_command("config alias list_partitions_in_window lparts")
