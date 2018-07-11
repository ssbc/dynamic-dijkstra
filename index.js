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

  function isEmpty (o) {
    for(var k in o) return false
    return true
  }

  function min (a, b) {
    if(a == null) return b
    return a < b ? a : b
  }

  exports.add = function (g, _g, max, hops, from, to, value, start) {
    if(to == from) return hops
    var _value = start === to ? opts.initial() : exports.recalculate(_g, hops, to)
    if(_value == hops[to]) {
      return hops
    }
    else if(opts.expand(hops[to]) && (_value == null || !opts.expand(_value, max))) {
      return hops
    }
    else if(hops[to] !== _value) {
      if(opts.expand(_value, max)) {
        if(to == 'A') {
          console.log("UPDATE", to, hops[to], _value)
          console.log(_g[to])
        }
       // console.log('add', from, to, value, [hops[to]])
        hops[to] = _value
      } else {
        delete hops[to]
      }

      if(opts.expand(hops[to], max)) {
//        console.log('expand:', to, hops[to])
        for(var _to in g[to])
          exports.add(g, _g, max, hops, to, _to, g[to][_to], start)
      }
    }
    return hops
  }

  exports.traverse = function (g, _g, max, from) {
    var next = {}
    var hops = {}
    hops[from] = opts.initial()
    for(var to in g[from])
      exports.add(g, _g, max, hops, from, to, g[from][to], from)
    return hops
  }

  exports.remove = function (g, _g, max, hops, from, to) {
    if(hops[to] == null) return hops //not included in traversal
    var _value = exports.recalculate(_g, hops, to)

    if(_value == null) //this vertice no longer reachable!
      delete hops[to]
    else
      hops[to] = _value

    for(var k in g[to])
      exports.remove(g, _g, max, hops, to, k)

    return hops
  }

  exports.recalculate = function (_g, hops, target) {
    var value = null
    for(var k in _g[target])
      if(hops[k] != null)
        value = opts.min(value, opts.add(hops[k], _g[target][k]))
    return value
  }

  return exports
}

