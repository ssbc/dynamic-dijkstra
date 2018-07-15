var merge = require('deep-merge')(function (a, b) { return b })
var random = require('./util').random
console.log(g)
var T = require('../')(require('../simple'))

var assert = require('assert')

for(var i = 0; i < 100;i ++) {
  console.log('...')
  var g = random(5, 3, [1,2])
  var g2 = random(3, 1, [1,0])
  console.log("g", g)

  var hops = T.traverse(g, null, 3, 'A')
  console.log('hops', hops)
//  console.log(g2)
  g4 = merge(g, {})
  for(var j in g2)
    for(var k in g2[j])
      T.update(g4, T.reverse(g4), hops, 3, 'A',j,k, g2[j][k])

  console.log("g'", g2)
  console.log("hops'", hops)
  var g3 = merge(g, g2)
  console.log('g3', g3)
  try {
  assert.deepEqual(hops, T.traverse(g3, null, 3, 'A'))
  } catch (err) {
    console.log('actual', hops)
    console.log('expected', T.traverse(g3, null, 3, 'A'))
    throw err
  }
}


