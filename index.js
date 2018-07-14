//var Heap = require('../bench-heap/array-and-sort')
var Heap = require('./fake-heap')

var _Heap = require('heap')
//var Heap = function (cmp) { return new _Heap(cmp) }

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
    else if(hops[to] !== _value) {
      if(opts.expand(_value, max)) {
        if(_value == null)
          delete hops[to]
        else
          hops[to] = _value
      } else {
        if(hops[to] != undefined) {
          delete hops[to]
          for(var _to in g[to])
            exports.add(g, _g, max, hops, to, _to, g[to][_to], start)
        }
      }


      if(opts.expand(hops[to], max)) {
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
  global.R = 0
  exports.recalculate = function (_g, hops, target) {
    var value = null
    for(var k in _g[target])
      if(hops[k] != null && k !== target) {
        value = opts.min(value, opts.add(hops[k], _g[target][k]))
      }
    global.R ++
    return value
  }

  function recalc(_g, hops, target, start) {
    if(start === target) return opts.initial()
    return exports.recalculate(_g, hops, target)
  }

  global.U = {}
  global.STATS = {pushes: 0, pops: 0, maxLength: 0}


  process.on('exit', function () {
    console.log(global.STATS)
    console.log(global.U)
  })

  exports.brute = function (g, _g, max, from, C) {
    var next = {}
    var hops = {}
    var queued = {}
    var next = Heap(function (a, b) {
      return hops[a] - hops[b]
    }, function (k) { return hops[k] })
    next.push(from)
    queued[from] = true
//    next[from] = opts.initial()
    var r = 0
//    while(!isEmpty(next)) {
//      if(--C === 0) {
//        console.log("LOOP", g, hops, from)
//        return hops
//      }

      while(!next.empty()) {
        var k = next.pop()

//      Object.keys(next).sort(function (a, b) {
//        return next[a] - next[b]
//      }).forEach(function (k) {
        //for(var k in next) {

          r++
          hops[k] = recalc(_g, hops, k, from)
//          delete next[k]
          if(opts.expand(hops[k], max))
            for(var j in g[k]) {
    //          var _h = opts.min(hops[j], opts.add(hops[k], g[k][j]))
              var _h = recalc(_g, hops, j, from)
              //console.log(_h, hops[j])
              if(_h != hops[j]) {
                if(!queued[j]) {
                  global.U[_h] = (U[_h] || 0) + 1
                  hops[j] = _h
                  next.push(j)
                  queued[j] = true
                  global.STATS.pushes ++
                  global.STATS.maxLength = Math.max(global.STATS.maxLength, next.size())
                }
              //[j] = opts.min(_h, next[j])
              }
            }
        //}
      }
//    }
    return hops
  }

//  exports.update = function (g, _g, max, start, from, to, value) {
//
//    var _h = opts.min(hops[from], opts.add(hops[to], value))
//    if(_h !== hops[to]) {
//      var next = {}
//      next[to] = true
//      while(!isEmpty(next)) {
//        for(var k in next) {
//          r++
//          hops[k] = recalc(_g, hops, k, from)
//          delete next[k]
//          for(var j in g[k]) {
//            var _h = opts.min(hops[j], opts.add(hops[k], g[k][j]))
//            if(_h != hops[j]) {
//              next[j] = true
//            }
//          }
//        }
//      }
//    }
//    return hops
//  }

  exports.assertFlat = function (g, _g, hops, max, from) {
    for(var k in hops) {
      var value = recalc(_g, hops, k, from)
      if(value !== hops[k]) {
        var _h = {}
        for(var j in _g[k])
          _h[j] = hops[j]+'->'+g[j][k]
        console.error('flat recalculation differs!'+k+' was:'+hops[k] + ' now:'+value, _h)
      }
    }
  }

  return exports
}


