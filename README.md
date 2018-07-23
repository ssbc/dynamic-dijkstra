# dynamic-dijkstra

Given a weighted directed graph, calculate shortest paths from a given point,
supports a dynamically updating graph (including both adding and removing edges)

This is needed in secure scuttlebutt to calculate what portion of the network to replicate.

## algorithm

The basic algorithm is just dijkstra's algorithm, and then there stuff to handle dynamic updates.
Note that calculating shortest paths in a dynamically updating graph is a _open problem_, so
no one knows what the best possible solution is. I have come up with some shortcuts that do
sufficiently well for this to be used in secure-scuttlebutt. Unfortunately, I wasn't able to read
most of the academic literature on this problem as it was too complicated for me.

## dijkstra's algorithm

Given a graph `g`, and starting node `S`, set `hops[S] = 0` and add S to a priority queue sorted
in ascending order by hops value. While queue is not empty, take the first item in the queue, `j`
and for each edge from `j`, `j->k` with weight `v`, check if `hops[k]` is undefined or higher than
`hops[j] + v` if so, set `hops[k] = hops[j] + v` and add `k` to the priority queue and continue.

> Note: all edges must be positive. In secure-scuttlebutt we use negative edges to represent various
kinds of edge removal, such as _unfollow_ and _block_. These are handled specially, see api documentation
below.

## adding edges

Adding edges is easy, adding an edge can either cause no change in the path lengths, or decrease them.
If the adding an edge from `j->k` (with weight `v`) does not change the distance to `k`, then we are already done.
That is, if `hops[k] == hops[j] + v`. If adding an edge _does_ reduce the shortest path to k,
it may also reduce the length of paths from k, so set the new value of hops[k], and run dijkstra's algorithm starting from k.

## removing edges

Removing edges is a lot more complicated. Here the shortest paths _may_ become longer.
The naive implementation is to just to rerun dijkstra's
algorithm from scratch, but this is very expensive if a lot of edges are removed. We calculate a
conservative set of nodes which _may_ become longer with the removal of the edge j->k.
This set is calculated by starting with k, and finding all nodes reachable from k, that currently
have a shortest path distance greater than k. note: in this traversable, "reachable" means that
for an edge a->b, with weight w, `hops[b] == hops[a] + w` if `hops[b] > hops[a] + w` that means
the shortest path to b is not through b, so we won't update the distance to b because of this edge.

> Note, in our usecase of secure scuttlebutt, most weights are whole numbers,
so often there are many paths which are equally short, if you used this module on a graph
with a different distribution of edge weights, performance may differ significantly.

Once we have the set of `maybe` nodes, we get the set of `sources`, the set of all nodes from
which the shortest paths into those nodes may come from. These are the nodes which have edges
into the `maybe` set. To calculate this efficiently, we maintain a data structure of the graph
with edges reversed. for each node in the `maybe` set, `m` we check all edges `s->m` with weight `w`,
and if `hops[s] + w == hops[m]` then we add `s`, other edges can be ignored.

Then, we delete the current hops values for every node in the `maybe` set, and rerun dijkstra's
algorithm from every node in the `source` set.

## api: DynamicDijkstra(options: Options) => traverser

for given configuration options, initialize a new `traverser` object. the `options`
defines the meaning various operations used in the algorithm.

### traverser.traverse(g, _g, max, start) => hops

traverse `g` starting from `start` and return the shortest path length to all nodes reachable
from `start` with path length less than `max`.

`_g` is the reverse of `g`. such that `g[j][k] = _g[k][j]`

### traverser.update (g, _g, hops, max, start, from, to, value) => diff

add an edge `from->to` with weight `value` to `g` and `_g`, and update `hops` to reflect
any changes in the shortest path. hops must be the correct shortest paths from `start`
on the graph prior to adding the edge `from->to, value`.

returns shortest path lengths that _changed_, and `{[k]: null,..}` if
a node `k` now no longer has a shortest path less than `max`.

### Options: {min, add, initial, expand, isAdd}

the options object defines the operations needed to process the traversal.
in secure-scuttlebutt these are just floats, 

#### min (a, b)

`min` returns the lower of two arguments. the return value must be the same with either argument order:
`min(a, b) === min(b, a)`

#### add (a, v)

Add an edge value to a path length. hop lengths must always get longer.
so the min of any possible edge value added to any length must always be greater than that length.
`min(a, add(a, v)) == a` (the min must be the original length)

#### isAdd(v)

return true if this value represents an edge addition.

#### expand (length, max)

return true if `length` is considered less than `max`, or otherwise paths may extend from it.

### ssb's options

In ssb we use 1 to represent follow, -1 to represent block, -2 to represent unfollow, and 0.1
to represent "same-as". A feed with path length 2 is a "friend of a friend" (we follow someone +1
who follows them + 1 = 2). If you block someone, that is -1. so -2 can mean blocked by a friend or unfollowed.
min defines a positive length to be less than the negative length with the same absolute value,
`min(-n, n) == n` so if a friend follows someone another friend blocks, the friends follow wins,
(but if you block them directly, that block wins over the friend's follow)

`expand(length, max)` return false if `length < 0`, or `length > max`.

`isAdd(v)` returns true if `v >= 0`

same-as is represented by very low weights (i.e. `0.1`)  to link two devices `a, b` together,
we have edges `a->b` and `b->a`. Low weights can also be used for delegation.
Say, a blocklist `l` can be implemented as a node that only blocks, then someone `x` subscribes
to that blocklist by adding edge `x->l` with a weight of `0.1`.


## License

MIT


