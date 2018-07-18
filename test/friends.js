'use strict'
var opts = require('../simple')
var T = require('../')(opts)
var friends = require('./data.json')
var assert = require('assert')
var g = {}
for(var k in friends)
  for(var j in friends[k]) {
    g[k] = g[k] || {}

    if(k == j) //ignore self-links
      ;
    else if(friends[k][j] === true)
      g[k][j] = 1
    else if(friends[k][j] === false)
      g[k][j] = -1
    else
      g[k][j] = -2
  }

function clone (o) {
  var _o = {}
  for(var k in o)
    _o[k] = o[k]
  return _o
}

var me = "@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519"
//console.log('start')
//hmm, JIT actually speeds this up from around 200 to ~80 ms

for(var i = 0; i < 10; i++) {
  var start = Date.now()
  var hops = T.traverse(g, null, 3, me)
  console.log({time: Date.now()-start, nodes:Object.keys(hops).length})
//console.log(hops)
}

var hops = {}, counts = {}

var s = Date.now(), e = 0
for(var k in g)
  for(var j in g[j])
    e++

console.log({edges:e, time:Date.now()-s})
//return
//process updates in order.

var g2 = {}, _g2 = {}

var e = 0, ts = Date.now()
var increment = 0, decrement = 0, check = 0, check2 = 0, check3 = 0

var total_updates = 0, total_updates2 = 0, total_decrements = 0
var hops = {}, skipped = {}, _hops = {}
_hops[me] = hops[me] = 0
var changes = {}
for(var j in g)
  for(k in g[j]) {
    //console.log(g[j][k])
    var v = g[j][k]
    e ++
    if(v < 0 || v == null) {
      ;(function () {
        total_decrements ++

//        var _hops = T.traverse(g2, null, 3, me)
        var already_closer_new_edge = hops[j] >= 0 && hops[j] < hops[k] && _v == null && hops[k] >= 0
        var _v = g2[j] && g2[j][k]

        //check that the traversals are the same
        //---------------------------
        var maybe = T.uncertain(g, hops, 3, k)
        var start = process.hrtime()
        var type
        if(false && already_closer_new_edge) {
          type = 'already_closer'
          g2[j] = g2[j] || {}
          _g2[k] = g2[k] || {}
          g2[j][k] = _g2[k][j] = v
        }
        else if(hops[k] == null && hops[j] >= 0) {
          type = 'new_edge'
          g2[j] = g2[j] || {}
          _g2[k] = g2[k] || {}
          g2[j][k] = _g2[k][j] = v
          if(opts.expand(hops[j], 3))
            hops[k] = opts.add(hops[j], v)
        }
        else {
          type = 'update'
          T.update(g2, _g2, hops, 3, me, j, k, v)
        }
        counts[type] = (counts[type] || 0) + 1
        var d, _dec
        decrement += _dec = process.hrtime(start)[1]
        //---------------------------

        var added = 0, removed = 0, changed = 0
        ;(function () {
          for(var k in hops) {
            if(_hops[k] == null) added ++
            else if(_hops[k] != hops[k]) changed ++
          }
          for(var k in _hops)
            if(hops[k] == null) removed ++
        })()

//        if(/*added + removed && */already_closer_new_edge)

        console.log({
          type: type,
          counts: counts,
          already_closer: already_closer_new_edge,
          source_in_hops: _hops[j] != null,
          from: _hops[j], to: _hops[k], value: v,
          changed: [added, removed, changed],
          feeds: Object.keys(hops).length
        })

        _hops = T.traverse(g2, null, 3, me)
        assert.deepEqual(Object.keys(hops).length, Object.keys(_hops).length)
        for(var l in hops) {
          if(hops[l] != _hops[l]) {
            console.log({prev: hops[l], new: _hops[l]})
            console.log(j,k,l)
//            throw new Error('weird update')
          }
        }
        assert.deepEqual(hops, _hops)

//        var already_closer_new_edge = _hops[j] >= 0 && _hops[j] >= _hops[k] && _v == null

//        if(added + removed) {

  //      }

/*
        if(
          false &&
          //hops[j] != null &&
          //(hops[j] > hops[k]) ||
          (  false
            //hops[k] >= 0 && hops[j] != null &&
            //opts.min(hops[k], opts.add(hops[j], v)) != opts.add(hops[j], v)
          )
//          opts.lt(hops[k], opts.add(hops[j], v))
        ) {
          g2[j] = g2[j] || {}
          _g2[k] = g2[k] || {}
          g2[j][k] = _g2[k][j] = v
          if(k == weird) {
            console.log('skip', hops[j], hops[k], v, {add: opts.add(hops[j], v)})
            console.log(g2[j][k])
          }
        }
        else
          T.update(g2, _g2, hops, 3, me, j, k, v)
*/

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
      var start = process.hrtime()
      T.update(g2, _g2, hops, 3, me, j, k, v)
      _hops = hops
      increment += process.hrtime(start)[1]
    }
    if(v !== g2[j][k] || v !== _g2[k][j])
      throw new Error('failed to add:'+j+':'+k+':'+v)

    if(Date.now() > ts + 1000) {
      console.log(e, Object.keys(hops).length)
//      var _hops = T.traverse(g2, null, 3, me)
      ts = Date.now()
    }

  }
//console.error(hops)
console.log({
  increment: increment/1000000,
  decrement: decrement/1000000,
  check:check/1000000,
//  check2: check2/1000000,
  check3: check3/1000000,
//  updates: total_updates,
  updates2: total_updates2,
  avg: total_updates2/total_decrements,
  changes: changes
})

//assert.deepEqual(g2, g, 'graphs are equal')

function assertEqualGraphs (g, g2, message) {
  var missing = 0
for(var j in g)
  for(var k in g[j])
    if(g2[j][k] != g[j][k]) {
      console.log(j, k, g[j][k], hops[k])
      missing ++
//      throw new Error('missing edge'+message)
    }
  if(missing)
    throw new Error('missing edges:' + missing + ' '+ message)
}

var _hops = T.traverse(g2, null, 3, me)
for(var k in hops)
  if(hops[k] && !_hops[k]) {
    if(hops[k] >= 0)
      console.log('expected :'+k+'to be -ve, was:'+hops[k])
  }

assertEqualGraphs(g, g2, ' edge missing from g2')
assertEqualGraphs(g2, g, ' additional edge over g')

//console.log(_hops)
console.log(Object.keys(hops).length, Object.keys(_hops).length)
assert.equal(Object.keys(hops).length, Object.keys(_hops).length)





















