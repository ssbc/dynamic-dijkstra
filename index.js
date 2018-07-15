//var Heap = require('../bench-heap/array-and-sort')
//var Heap = require('./fake-heap')

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

//  function isEmpty (o) {
//    for(var k in o) return false
//    return true
//  }
//
//  function min (a, b) {
//    if(a == null) return b
//    return a < b ? a : b
//  }

  exports.traverse = function (g, _g, max, from) {
    return exports.brute(g, _g, max, from)
  }

  function _loop (g, max, hops, from) {
    var next = Heap(function (a, b) {
      return hops[a] - hops[b]
    }, function (k) { return hops[k] })
    next.push(from)

    while(!next.empty()) {
      var k = next.pop()

      if(opts.expand(hops[k], max))
        for(var j in g[k]) {
          var _h = opts.min(hops[j], opts.add(hops[k], g[k][j])) //recalc(_g, hops, j, from)
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
    return _loop(g, max, hops, from)
  }

  exports.update = function (g, _g, hops, max, start, from,to,value) {
    g[from] = g[from] || {}
    g[from][to] = value

    //added edge cannot be in traversal if it's starting point isn't
    if(hops[from] == null) return hops
    var h = opts.min(hops[to], opts.add(hops[from], value))

    if(value < 0 || value == null) throw new Error('not yet implemented:remove')

    //if destination is max or more, do not add edge
    if(!opts.expand(hops[from], max)) return hops

    //var h = opts.min(hops[to], opts.add(hops[from], value))
    if(h != hops[to]) {
      hops[to] = h
      _loop(g, max, hops, to)
      //we added the edge.
      //now check if this has brought other edges into the graph
    }

    return hops

  }

  exports.assertFlat = function (g, _g, hops, max, from) {
//    for(var k in hops) {
//      var value = recalc(_g, hops, k, from)
//      if(value !== hops[k]) {
//        var _h = {}
//        for(var j in _g[k])
//          _h[j] = hops[j]+'->'+g[j][k]
//        console.error('flat recalculation differs!'+k+' was:'+hops[k] + ' now:'+value, _h)
//      }
//    }
  }

  return exports
}





