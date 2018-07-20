'use strict'
var opts = require('../simple')
var T = require('../')(opts)
var assert = require('assert')
var pull = require('pull-stream')

var CHECK = false, SHORTCUTS = false

function update_graphs(g, _g, j, k, v) {
  g[j] = g[j] || {}
  //oops: this was previously _g[k] = g[k] || {}
  //took me ages to figure this out!
  _g[k] = _g[k] || {}
  g[j][k] = _g[k][j] = v
}

function assertEqualGraphs (g, g2, message) {
  var missing = 0
  for(var j in g)
    for(var k in g[j])
      if(g2[j][k] !== g[j][k]) {
        console.log(j, k, g[j][k], g2[j][k], hops[k])
        missing ++
      }
  if(missing)
    throw new Error('missing edges:' + missing + ' '+ message)
}

function compareHops(hops, _hops, j, k) {
  var d = 0
  for(var k in hops) {
    if(hops[k] != _hops[k]) {
      d++
      console.log(k, {prev: hops[k], new: _hops[k]})
    }
  }
  return d
}

var me = "@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519"

module.exports = function () {
  var g2 = {}, _g2 = {}, e = 0, hops = {}, _hops = {}
  var e = 0, ts = Date.now()
  var increment = 0, decrement = 0, check = 0, check2 = 0, check3 = 0
  var total_updates = 0, total_updates2 = 0, total_decrements = 0
  var counts = {}, state = {}, changes = {}, add = 0
  return pull.drain(function (edge) {
      var j = edge.from
      var k = edge.to
      var v = edge.value

  //exports.onEdge = function onEdge (j, k, v) {
  //  j = edge.from
  //  k = edge.to
  //  v = edge.value
    e ++
    if(v < 0 || v == null) {
      ;(function () {
        total_decrements ++
        var _v = g2[j] && g2[j][k]

        var already_closer = (
          //if previous value was null, or previous didn't set the hops value anyway.
          (_v == null  || (opts.add(hops[j], _v) !== hops[k])) &&
          opts.min(hops[k], opts.add(hops[j], v)) === hops[k]
        )

        var new_edge = hops[k] == null && hops[j] >= 0

        var unchanged_hops = opts.add(hops[j], v) === hops[k]


        //check that the traversals are the same
        //---------------------------
        var start = process.hrtime()
        var type

        if(SHORTCUTS && already_closer) {
          type = 'already_closer'
          update_graphs(g2, _g2, j,k,v)
        }
        else if(SHORTCUTS &&
          //if the current value would beat this link, check that there is another link to beat it.
          //this catches the case when someone unfollows, but there is another path the same length.
          (
            hops[k] == opts.add(hops[j], _v) && 
            hops[k] === opts.min(hops[k], opts.add(hops[j], v))
          ) &&
          (function () {
            for(var _j in _g2[k])
              if(_j !== j && opts.add(hops[_j], g2[_j][k]) === hops[k]) {
                return true
              }
          }())
        ) {
          type = 'backlink'
          update_graphs(g2, _g2, j,k,v)
        }
        else if(SHORTCUTS && new_edge) {
          type = 'new_edge'
          update_graphs(g2, _g2, j,k,v)
          if(opts.expand(hops[j], 3))
            hops[k] = opts.add(hops[j], v)
        } 
        else {
          type = 'update'

//          var hops2 = {}
//          for(var _k in hops) hops2[_k] = hops[_k]
//          var data = {
//            _v: _v,
//            v: v,
//            from: hops[j], to: hops[k],
//            closer: already_closer_new_edge,
//            add: opts.add(hops[j], v),
//            min: opts.min(hops[k], opts.add(hops[j], v)),
//            closer2: opts.min(hops[k], opts.add(hops[j], v)) == hops[k]
//          }
//          var start = process.hrtime()

          T.update(g2, _g2, hops, 3, me, j, k, v)

//          var time = process.hrtime(start)[1] / 1000000
//          var c = 0
//          for(var _k in hops) if(hops2[_k] !== hops[_k]) c++
//          var ch = changes[c] = (changes[c] || {count: 0, time: 0})
//          ch.count ++
//          ch.time += time
//          ch.avg = Math.round((ch.time / ch.count)*1000)/1000
//          if(c === 1) console.log(data)
        }
        var d, _dec
        decrement += _dec = process.hrtime(start)[1]

        state = {
          type: type,
          counts: counts,
          already_closer: already_closer,
          source_in_hops: hops[j] != null,
          from: hops[j], to: hops[k], value: v,
          decrement: decrement/1000000,
          changes: changes
        }

        counts[type] = (counts[type] || 0) + 1
        //---------------------------

        if(CHECK) {
        var __hops = T.traverse(g2, null, 3, me)
          if(compareHops(hops, __hops)) {
            console.log(state)
            throw new Error('hops wrong')
          }
        }
        if(null == g2[j][k])
          throw new Error('failed to add:'+j+':'+k+':'+v)

        if(false)
          console.log('maybe', {
            value: v,
            hops: Object.keys(hops).length,
            maybe: Object.keys(maybe).length,
            maybe_time: d/1000000,
            decrement_time: _dec / 1000000,
            nodes: Object.keys(hops).length,
            updates2: Object.keys(update2).length
          })

        if(false) {
          _g2[k] = _g2[k] || {}
          g2[j] = g2[j] || {}
          g2[j][k] = _g2[k][j] = v
        }

      })()

    } else {
      counts.add = (counts.add || 0) + 1
      var start = process.hrtime()
      T.update(g2, _g2, hops, 3, me, j, k, v)
      _hops = hops
      increment += process.hrtime(start)[1]
    }
    if(v !== g2[j][k] || v !== _g2[k][j])
      throw new Error('failed to add:'+j+':'+k+':'+v)

    if(Date.now() > ts + 1000) {
      console.log(e, Object.keys(hops).length)
      console.log(state)
      var _hops = T.traverse(g2, null, 3, me)
      assert.deepEqual(hops, _hops)
      ts = Date.now()
    }
  }, function () {
    //console.error(hops)
    console.log({
      increment: increment/1000000,
      decrement: decrement/1000000,
      changes: changes
    })

    //assert.deepEqual(g2, g, 'graphs are equal')

    var _hops = T.traverse(g2, null, 3, me)
    for(var k in hops)
      if(hops[k] && !_hops[k]) {
        if(hops[k] >= 0)
          console.log('expected :'+k+'to be -ve, was:'+hops[k])
      }

//    assertEqualGraphs(g, g2, ' edge missing from g2')
//    assertEqualGraphs(g2, g, ' additional edge over g')

    //console.log(_hops)
    console.log(state)
    console.log(Object.keys(hops).length, Object.keys(_hops).length)
    assert.equal(Object.keys(hops).length, Object.keys(_hops).length)


  })
}











