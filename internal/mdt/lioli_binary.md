# A binary format for LioLi

The LioLi is created from multiple drivers, and gets passed under a binary form to SQLite for processing, and then for serialization over HTTP.
The format is meant to be reasonable compromise between the simplicity of the implementation, the compression speed and efficiency.

Most importantly, the format is meant to be directly addressable and modifiable¹, both for pivot expressions and final HTTP encoding.
The LioLi is encoded as a stream of pivots (further work will address compression on the shared text content), but each record can be individually read and decoded.

[1] This only concerns filtering and appending of new values.

## General algorithm

We use a pre-order tree walk, with a skip link pointing to the next record at a given level (See Knuth, 2.3.3 (6)).
We use a bit marker to know if the next node is a child node, or the next node.

Each node is serialized using:
 - an optional v16-encoded skip pointer to the next record
 - a delta encoded pair of window values
 - a variably-encoded node metadata

## Delta encoding of window values

Lo and Hi are naturally sorted, and for Pⱼ, Pₖ a parent node, and Cⱼ, Cₖ children nodes:
 - Pⱼ.Lo ≤ Pⱼ.Hi
 - Pⱼ.Hi ≤ Pₖ.Lo
 - Pⱼ.Lo ≤ Cⱼ.Lo
 - Cₖ.Hi ≤ Pₖ.Hi

The algorithm uses the three relations to measure the delta between values.

The three last relations are usually much lower in magniture than the first one, which can be used in encoding, with three different nodes:
 1. If the higher bit of the node is zero, the next 3 bits encode Pⱼ.Lo and the next 4 bits Pⱼ.Hi
 2. If the higher bits are 10, the next 6 bits encode Pⱼ.Lo and the next 8 bits Pⱼ.Hi
 3. If the higher bits are 11, the next 14 bits encode Pⱼ.Lo and the next 16 bits Pⱼ.Hi

## Variable encoding of node metadata

The node metadata consists of the name, and a marker to know if the node has children.
It is encoded on a variable size:
 1. The higher bit of the node is the marker
 2. If the second high bit is 1, the node name is taken from a dictionary, with index based on the next 6 bits
 3. Otherwise, the 5 bits and the next bytes are varint-encoded size, then the name of the node

Node names are repeated between records; and both ends of the encoding can further decide to share a dictionary of names; this mechanism is not (yet) covered by this specification.
If such a dictionary exists, it can be used by the node encoding to replace the varint-encoded name of the string.


## Further work

Compression (snappy-style) for the data itself
Dictionary of node names
Zero-copy interface for the LioLi and binary?