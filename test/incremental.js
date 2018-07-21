var merge = require('deep-merge')(function (a, b) { return b })
var u = require('./util')
console.log(g)

var opts = require('../simple')
var T = require('../')(opts)

var assert = require('assert')

function clone (g) {
  var _g = {}
  for(var j in g) {
    _g[j] = {}
    for(var k in g[j])
      _g[j][k] = g[j][k]
  }
  return _g
}

function equal(a, e) {
  try {
    assert.deepEqual(a, e)
  } catch (err) {
    console.log('actual', a)
    console.log('expected', e)
    throw err
  }

}

for(var i = 0; i < 10000;i ++) {
//  console.log('---')
  if(!(i%1000)) console.log(i)

  var g = u.random(10, 6, [1,2])
  var g2 = u.random(5, 1, [1,0])
  //console.log("g", g)

  var hops = T.traverse(g, null, 3, 'A')
//  console.log('hops', hops)
//  console.log(g2)
  g4 = merge(g, {})
  ;(function () {
  var _g4 = T.reverse(g4)
  for(var j in g2)
    for(var k in g2[j])
      T.update(g4, _g4, hops, 3, 'A',j, k, g2[j][k])
  })()
//  console.log("g'", g2)
//  console.log("hops'", hops)
  var g3 = merge(g, g2)
//  console.log('g3', g3)
  equal(hops, T.traverse(g3, null, 3, 'A'))

  //remove an edge
//
//  var edge = u.randomEdge(g4)
  for(var j = 0; j < 5; j++) {
    var edge = {from: u.randomNode(g), to: u.randomNode(g)}
//    console.log("REMOVE", edge)
//    console.log('var g = ', g4)
    //recalculate all nodes with distance greater than what the removed edge was.
    edge.value = -1
    if(edge.to != 'A') {
      ;(function () {
        var g = clone(g4)
        var _g4 = T.reverse(g4)
        T.update(g4, _g4, hops, 3, 'A', edge.from, edge.to, -1)
        var _hops = T.traverse(g4, null, 3, 'A')
      //  console.log('hops:',hops, '(updated)')
        try {
          equal(hops, _hops)
        } catch(err) {
          console.log('var g = ', g)
          console.log('var edge = ', edge)
          throw err
        }
      })()
    
    }
  }
  //check this is the same as a single traversal
//  equal(hops, T.traverse(g4, null, 3, 'A'))
}


