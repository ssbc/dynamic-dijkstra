'use strict'
var _Heap = require('heap')
var Heap = function (cmp) { return new _Heap(cmp) }

module.exports = function (opts) {
  var exports = {}

  //take a graph, and return it's inverse
  exports.reverse = function (g) {
    var _g = {}
    for(var k in g) {
      for(var j in g[k]) {
        _g[j] = _g[j] || {}
        _g[j][k] = g[k][j]
      }
    }
    return _g
  }

  exports.traverse = function (g, _g, max, from) {
    return exports.brute(g, _g, max, from)
  }

  function _loop (g, max, hops, next) {
    while(!next.empty()) {
      var k = next.pop()
//      console.log('loop', k)
      if(opts.expand(hops[k], max))
        for(var j in g[k]) {
          var _h = opts.min(hops[j], opts.add(hops[k], g[k][j]))
  //        console.log(k,j, [hops[j], _h])
          if(isNaN(_h)) throw new Error('NaN')
          if(_h != hops[j]) {
            hops[j] = _h
            next.push(j)
          }
        }
    }
    return hops
  }

  exports.brute = function (g, _g, max, from, C, LOG) {
    var hops = {}
    hops[from] = opts.initial()
    var next = Heap(function (a, b) {
      return hops[a] - hops[b]
    }, function (k) { return hops[k] })
    next.push(from)
    return _loop(g, max, hops, next)
  }

  //find all nodes reachable via `from` with hops at > was
  exports.uncertain = function (g, hops, max, start) {
    var was = hops[start]
    var maybe = {}
    maybe[start] = true
    var next = Heap(function (a, b) {
      return hops[a] - hops[b]
    })
    next.push(start)
    while(!next.empty()) {
      var k = next.pop()
      for(var j in g[k])
        if(hops[j] === opts.add(hops[k], g[k][j])) {
          if(!maybe[j]) {
            maybe[j] = true
            next.push(j)
          }
        }
    }
    return maybe
  }

  exports.sources = function (_g, hops, maybe) {
    if(!_g) throw new Error('backlink graph must be provided')
    var update = {}
    for(var k in maybe)
      if(hops[k])
        for(var j in _g[k])
          if(!maybe[j])
            update[j] = true
    return update
  }

  exports.update = function (g, _g, hops, max, start, from,to,value) {
    hops[start] = opts.initial()
    //added edge cannot be in traversal if it's starting point isn't
    if(value >= 0) {
      g[from] = g[from] || {}
      _g[to] = _g[to] || {}
      g[from][to] = _g[to][from] = value
    }

    if(hops[from] == null || from == to) return hops
    var h = opts.min(hops[to], opts.add(hops[from], value))

    if(value >= 0) {
      //if destination is max or more, do not add edge
      if(!opts.expand(hops[from], max)) return hops

      if(h != hops[to]) {
        var next = Heap(function (a, b) {
          return hops[a] - hops[b]
        }, function (k) { return hops[k] })
        next.push(to)

        hops[to] = h
        _loop(g, max, hops, next)
        //we added the edge.
        //now check if this has brought other edges into the graph
      }

    } else {
      if(!value && !_g) throw new Error('expected increment:'+value)
      var next = Heap(function (a, b) {
        return hops[a] - hops[b]
      }, function (k) { return hops[k] })

      //if the path removed is the edge keeping this node
      //in the graph, then the graph will totally change.

      var _value_from_us = opts.add(hops[from], g[from] && g[from][to])
      var value_from_us = opts.add(hops[from], value)
      if(
        to === start || //don't ever remove self from graph
        !opts.expand(hops[from], max) ||
        (
          false &&
          //if the current value is the value from this branch
          g[from] && g[from][to] === null &&
          //this means we might be the one to bring this into the traversal
          (
            hops[to] !== opts.add(hops[from], value) &&
            hops[to] === opts.min(hops[to], opts.add(hops[from], value))
//            hops[to] === opts.min( _value_from_us &&
//            value_from_us === opts.min(hops[to], value_from_us)
          )
        )


//        (hops[to] === opts.min(hops[to], opts.add(hops[from], value)))
      ) {
//        console.log('skip', hops[from], hops[to])
/*
        console.log("SKIP REMOVE", hops[from], hops[to], value,
        {
          to:hops[to],
          add: opts.add(hops[from], value),
          min: opts.min(
            hops[to], opts.add(hops[from], value)
          )
        }
        )
*/
        g[from] = g[from] || {}
        _g[to] = _g[to] || {}
        g[from][to] = _g[to][from] = value
        return hops
      }

//      console.log(
//        'DECREMENT',
//        {from: hops[from], to: hops[to]},
//        [from, to, value]
//      )

      var maybe = exports.uncertain(g, hops, max, to)
//      console.log('maybe', maybe)
      for(var k in maybe)
        if(hops[k] != null &&
          hops[k] < hops[to] && hops[k] > 0
        ) {
          throw new Error('maybe must be higher')
        }
      var sources = exports.sources(_g, hops, maybe)
      g[from] = g[from] || {}
      _g[to] = _g[to] || {}
      g[from][to] = _g[to][from] = value

      sources[from] = true
      for(var k in maybe) delete hops[k]

      return exports.updateAll(g, hops, max, sources)
    }

    return hops

  }

  exports.updateAll = function (g, hops, max, sources) {
    var next = Heap(function (a, b) { return hops[a] - hops[b] })

    for(var k in sources) next.push(k)

    _loop(g, max, hops, next)
    return hops
  }

  return exports
}






