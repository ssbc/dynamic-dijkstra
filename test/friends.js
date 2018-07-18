'use strict'
var fs = require('fs')
var path = require('path')
var opts = require('../simple')
var T = require('../')(opts)
var friends = require('./data.json')
var assert = require('assert')

var CHECK = false

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

function clone (o) {
  return JSON.parse(JSON.stringify(o))
}

var total_updates = 0, total_updates2 = 0, total_decrements = 0
var hops = {}, skipped = {}, _hops = {}, state
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
        var previous_hops = _hops
        var already_closer_new_edge = (
          _v == null &&
          opts.min(hops[k], opts.add(hops[j], v)) == hops[k]
//          hops[j] >= 0 && hops[j] < hops[k] &&
//          _v == null && hops[k] >= 0 &&
//          opts.min(hops[j], opts.add(hops[j], v)) == hops[k]
        )

        var _v = g2[j] && g2[j][k]

//        var g3 = clone(g2)
//        var _g3 = clone(_g2)

//        assert.deepEqual(g3, g2)

        //check that the traversals are the same
        //---------------------------
        var start = process.hrtime()
        var type

        if(true && already_closer_new_edge) {
          type = 'already_closer'
          update_graphs(g2, _g2, j,k,v)
        }
        else if(hops[k] == null && hops[j] >= 0) {
          type = 'new_edge'
          update_graphs(g2, _g2, j,k,v)
          if(opts.expand(hops[j], 3))
            hops[k] = opts.add(hops[j], v)
        } else if(
          hops[j] <= hops[k] &&
          //if the current value would beat this link,
          //check wether there is something else to back it up.
          hops[k] === opts.min(hops[k], opts.add(hops[j], v)) &&
          (function () {
            for(var _j in _g2[k])
              if(_j !== j && opts.add(hops[_j], g2[_j][k]) === hops[k]) {
                return true
              }
          }())
        ) {
          type = 'backlink'
          if(false) {
    
            var __hops = clone(hops)
            var g4 = clone(g2)
            assert.deepEqual(g4, g2, 'graph copied')
            var _g4 = clone(_g2)

            console.log('PRECHECK>>')
              assertEqualGraphs(g2, g4, ' edge missing from g4')
              assertEqualGraphs(g4, g2, ' additional edge over g2')
              assertEqualGraphs(_g2, _g4, ' edge missing from _g4')
              assertEqualGraphs(_g4, _g2, ' additional edge over _g2')
            console.log('<<PRECHECK')

            T.update(g2, _g2, hops, 3, me, j, k, v)
            console.log("UPDATED")

            assert.equal(g2[j][k], v, 'copied value')
            assert.equal(_g2[k][j], v, 'copied _value')

            update_graphs(g4, _g4, j,k,v)
            assert.deepEqual(__hops, hops)

            assert.equal(g4[j][k], g2[j][k])
            assert.equal(_g4[j][k], _g2[j][k])

            console.log('ADD', [j,k,v])

            console.log('POSTCHECK>>')
            assertEqualGraphs(g2, g4, ' edge missing from g4')
            assertEqualGraphs(g4, g2, ' additional edge over g2')
            console.log('reverse')
            assertEqualGraphs(_g4, _g2, ' additional edge over _g2')
            console.log('reverse2')
            assertEqualGraphs(_g2, _g4, ' edge missing from _g4')
            console.log('<<POSTCHECK')

            assert.deepEqual(g4, g2)
            assert.deepEqual(_g4, _g2)

          } else
            update_graphs(g2, _g2, j,k,v)
        }
        else {
          type = 'update'
          T.update(g2, _g2, hops, 3, me, j, k, v)
        }
        var d, _dec
        decrement += _dec = process.hrtime(start)[1]

        counts[type] = (counts[type] || 0) + 1
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

        state = {
          type: type,
          counts: counts,
          already_closer: already_closer_new_edge,
          source_in_hops: _hops[j] != null,
          from: _hops[j], to: _hops[k], value: v,
          changed: [added, removed, changed],
          feeds: Object.keys(hops).length,
          decrement: decrement/1000000
        }

        if(CHECK) {
        var __hops = T.traverse(g2, null, 3, me)
          if(compareHops(hops, __hops)) {
            console.log(state)
            throw new Error('hops wrong')
          }
        }
/*
        assert.deepEqual(_hops3, _hops, 'pre-update hops equal')
        assert.notDeepEqual(g3, g2)

        T.update(g3, _g3, _hops3, 3, me, j, k, v)
        assert.equal(g3[j][k], g2[j][k])
        assertEqualGraphs(g2, g3, ' edge missing from g3')
        assertEqualGraphs(g3, g2, ' additional edge over g2')

        assert.deepEqual(g2, g3, 'shortcut graphs equal')
*/
/*
        _hops = T.traverse(g2, null, 3, me)
//        if(already_closer_new_edge)
//          assert.deepEqual(previous_hops, _hops, 'already closer: no change?')

        try {
//          assert.deepEqual(Object.keys(hops).length, Object.keys(_hops).length)

  //        compareHops(hops, _hops)
    //        assert.deepEqual(hops, _hops)
        } catch (err) {
          delete g2[j][k]
          fs.writeFileSync(path.join(__dirname, 'problem.json'),
            JSON.stringify({
              graph: g2,
              hops: previous_hops,
              edge: {from: j, to:k, value: v},
              start: me,
              max: 3
            })
          )
          console.log(state)
          throw err
        }
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
      console.log(state)
      var _hops = T.traverse(g2, null, 3, me)
      compareHops(hops, _hops)
      assert.deepEqual(hops, _hops)
      ts = Date.now()
    }

  }
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

assertEqualGraphs(g, g2, ' edge missing from g2')
assertEqualGraphs(g2, g, ' additional edge over g')

//console.log(_hops)
console.log(Object.keys(hops).length, Object.keys(_hops).length)
assert.equal(Object.keys(hops).length, Object.keys(_hops).length)








