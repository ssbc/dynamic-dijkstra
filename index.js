'use strict'
var _Heap = require('heap')
var Heap = function (cmp) { return new _Heap(cmp) }

module.exports = function (opts) {
  var exports = {}

  function getValueFromEdge(hops, j, v) {
    return opts.add(hops[j], v)
  }

  function getNewValue(hops, j, k, v) {
    return opts.min(hops[k], getValueFromEdge(hops, j, v))
  }

  function isUnchangedByEdge (hops, j, k, v) {
    return hops[k] === opts.add(hops[j], v)
  }

  function isUnchanged (hops, j, k, v) {
    return hops[k] === getNewValue(hops, j, k, v)
  }

  //"increment" is an edge that shortens graph distances
  //adding a new edge always decreases hops, or decreasing
  //the weight of an edge. (see the literature on dynamic graphs)
  function isIncrement (value, old_value) {
    return (
      opts.isAdd(value) && (
        opts.isRemove(old_value) || (opts.min(value, old_value) == value)
      )
    )
  }

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

  function _loop (g, max, hops, next, _hops) {
    if(!_hops) throw new Error('_hops must be provided')
    while(!next.empty()) {
      var j = next.pop()
      if(opts.expand(hops[j], max))
        for(var k in g[j]) {
          var _h = getNewValue(hops, j, k, g[j][k])
          if(isNaN(_h)) throw new Error('NaN')
          if(_h != hops[k]) {
            _hops[k] = hops[k] = _h
            next.push(k)
          }
        }
    }
    return _hops
  }

  exports.traverse = exports.brute = function (g, _g, max, from) {
    var hops = {}
    hops[from] = opts.initial()
    var next = Heap(function (a, b) {
       return hops[a] - hops[b]
    }, function (k) { return hops[k] })
    next.push(from)
    return _loop(g, max, hops, next, hops)
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
      var j = next.pop()
      for(var k in g[j])
        if(
          isUnchangedByEdge(hops, j,k,g[j][k])
        //hops[k] === opts.add(hops[j], g[j][k])
        ) {
          if(!maybe[k]) {
            maybe[k] = true
            next.push(k)
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
          if(!maybe[j] && hops[j] != null)
            update[j] = true
    return update
  }

  function update_graphs(g, _g, from, to, value) {
    g[from] = g[from] || {}
    _g[to] = _g[to] || {}
    g[from][to] = _g[to][from] = value
  }

  exports.update = function (g, _g, hops, max, start, from,to,value) {
    var _hops = {}
    if(hops[start] == null) hops[start] = opts.initial()

    var old_value = g[from] && g[from][to]

//    if(from == to) {
//      update_graphs(g, _g, from, to, value)
//      return null
//    }
//    else

    if(isIncrement(value, old_value)) {
      update_graphs(g, _g, from, to, value)

      //if from isn't within hops, then to won't be in hops either.
      if(hops[from] == null || from == to) return null


      var h = getNewValue(hops, from, to, value)
      //if source is max or more, do not add edge
      if(!opts.expand(hops[from], max)) return null

      //check if there is another edge that keeps this value alive.
      if(h == hops[to] && opts.add(hops[from], old_value) == hops[to]) {
        for(var _from in _g[to])
          if(_from != from && opts.expand(hops[_from], max) && opts.add(hops[_from], g[_from][to]) === hops[to])
            return null
        var _h = null
        for(var _from in _g[to])
          if(hops[_from] != null && opts.expand(hops[_from], max)) {
            _h = opts.min(_h, opts.add(hops[_from], g[_from][to]))
          }
        h = _h
      }

      //hops will change
      if(h != hops[to]) {
        _hops[to] = hops[to] = h
        //if this edge is at the limit, we are done.
        if(!opts.expand(hops[to], max)) return _hops

        //setup heap and run dijkstra's algorithm
        var next = Heap(function (a, b) { return hops[a] - hops[b] })
        next.push(to)
        return _loop(g, max, hops, next, _hops)
      }
      //undefined!
      return null
    }
    //handle unfollow and block (aka decrements)
    else {
      if(!value && !_g) throw new Error('expected increment:'+value)
      var j = from, k = to, v = value, _v = g[from] && g[from][to]

      //shortcut 1: detect cases that won't change the hops
      if(
        to === start || //can't block yourself, so don't update hops.
        //if from isn't within hops, then to won't be in hops either.
        from == to ||
        //they are already blocked, stop tracking hops from them
        (!opts.expand(hops[j], max)) ||
        ( //already closer
          //if previous value was null, or previous didn't set the hops value anyway.
          //and the hops value will be the same, then don't update hops.
          (_v == null  || !isUnchangedByEdge(hops, j, k, _v)) &&
          isUnchanged(hops, j, k, v)
        ) || (
          //if this edge _did_ set the hops value, check if there is another edge which also sets it.
          //this catches the case when someone unfollows, but there is another follow path the same length.
          //only applies when there was a previous edge.
            (_v == null || isUnchangedByEdge(hops, j, k, _v)) &&
            isUnchanged(hops, j, k, v) &&
            //quickly check if any other edges set hops
            (function () {
              for(var _j in _g[k])
                if(_j !== j && hops[_j] != null && isUnchangedByEdge(hops, _j, k, g[_j][k]))
                  return true
            }())
        )
      ) {
        //won't change hops, so update graph and return
        update_graphs(g, _g, from, to, value)
        return null
      }
      //shortcut 2. detect cases that will add exactly 1 element to hops
      //adding negative edge to someone not already in hops.
      else if (opts.isRemove(v) && hops[j] >= 0 && hops[k] == null) {
        //only adds the new item, but won't expand since this is a block.
        update_graphs(g, _g, j,k,v)
        if(opts.expand(hops[j], 3)) //XXX is this really where the default is set?
          _hops[k] = hops[k] = opts.add(hops[j], v)
        return _hops
      }
      //the long way. calculate all hops that may be changed by this edge and recalculate them.
      else {
        var next = Heap(function (a, b) {
          return hops[a] - hops[b]
        }, function (k) { return hops[k] })

        var maybe = exports.uncertain(g, hops, max, to)
        var sources = exports.sources(_g, hops, maybe)

        update_graphs(g, _g, from, to, value)

        sources[from] = true
        var pre = {}
        for(var _k in maybe) {
          pre[_k] = hops[_k]
          delete hops[_k]
        }

        var diff = exports.updateAll(g, hops, max, sources, _hops)

        for(var k in pre)
          if(diff[k] == pre[k])
            delete diff[k]

        return diff
      }
    }
  }

  exports.updateAll = function (g, hops, max, sources, _hops) {
    var next = Heap(function (a, b) { return hops[a] - hops[b] })

    for(var k in sources) next.push(k)

    return _loop(g, max, hops, next, _hops)
  }

  return exports
}

