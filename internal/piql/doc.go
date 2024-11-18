/*
Package piql implements parsing, pretty printing and checking for the Pivot Query Language.

The Pivot Query Language (abbreviated “PiQL” in this document) is a language designed to express common analytics queries quickly, supported by a user interface.

Like all pivots, a query only takes effect when it is applied on a path [1].
Examples here are going to be provided using the syntax `Pivot = Query "[" Path "]" { "; " Pivot } .`.
The syntax is used internally, and is represented under a convenient graphical form in our data cell [2].

Notes:
 1. The current API actually allow for multiple path application. This is something we will probably remove soon.
 2. The only format currently used in the system is JSON-based. Again, something to improve.

In order to support a gesture-based UI, a single operation (filter, window, …), might actually be specified over multiple pivots.
For example, the query: `over 1h [$.date]; limit 4 [$.ip]; by [$.account]` is coded over 3 pivots (each with indivdual pills), but logically expresses a single window function.
It is syntaxically correct to only provide a partial specification of a multi-pill pivot; in this case, the operation has no effect.

The language is also designed to be unambiguous: the order of the pills is defined, but we accept out-of-order entries, so as not to put an uncessary burden on the user memory.

# Language Grammar

At the top level, a query operates either on a single line, or on a window:

	pivotop = (stringmatch | timematch | windowop) ";".

String matches allow for exact match, and regexp search:

	stringmatch = "|=" csvalues | "|~" regexp | "!=" csvalues | "!~" regexp .
	csvalues    = value ["," value] .

Time functions can be specified from a convenient mini-language:

	timematch = ("|>" | "|<" | "after" | "before") timespec
			  | ("|><" | "between") timespec "and" timespec .

The time spec can express both absolute timestamps (in ISO8601 format), and relative intervals:

	timespec = day ["at " hour] | "\"" timestamp "\"" .
	day      = "today" | "yesterday" | "last" weekday | number period "ago" .
	weekday  = "monday" … "sunday" .
	period   = "day" | "week" | "hour" .

Window operators are multi-pills, starting with “over”. As specified in the intro, the ";" refers to the pill separator, not to something that must be typed in.

	windowop    = "over" duration ["hop" duration] ["grace" duration] ";" windowquery .
	partition   = {"by" ";"}
	windowquery = partition "limit" number
				| "first" stringmatch ";" "then" stringmatch ";" partition .

TODO(rdo) better API to differenciate lexemes and expressions
*/
package piql
