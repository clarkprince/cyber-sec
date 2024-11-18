# Choosing Good Columns Width


This algorithm is strongly inspired from TeX’s “Breaking Paragraphs into Lines”

## Formulating the problem

In this memo, a columns cₖ has desired width Wₖ and actual width wₖ, displaying zₖ characters.
wₖ is measured in arbitrary unit (but in practice mapped to the CSS “ch” unit, so zₖ ≈ wₖ). 
The desired width Wₖ is set as the maximum between (1) displaying all data on screen, and (2) filling all the available screen width (modulo increments in a grid system).
We also have a function B which weights the difference between Wₖ and wₖ, based on the content of the data cell.

The goal is to find w₁, …, wₙ such that we have a global minimum of ∑ B(Wₖ, wₖ).

Choosing a good function B is complicated: a trivial function could be the difference between the number of characters in the data set, minus the number of characters on the screen.
But doing so would clearly penalize short columns, which are actually often the most important ones (long columns tend to be un-parsed text).
Instead, we choose to even the weight given to each column by using the _distribution_ of the values: B(Wₖ, wₖ) = zₖ ÷ Zₖ with Zₖ the total number of characters.
B is further simplified by only considering deciles (⌊zₖ ÷ 10⌋).

// document the penalty

## The algorithm

Let the total size of the screen be S; it is divided into a maximum number of columns based on known grid systems (12 for laptop size, 16 otherwise).
The number of columns is then reduced if the view port requires less columns on display.

The increment is set to 8 arbitrary units (again, “ch” in practice), following a 8pt-design system.

Initially, all columns are set to size 0.

In a loop, the column which would benefit most from a size increase – by minimizing B(Wₖ, wₖ′) – is increased until the screen size is reached.