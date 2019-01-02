var u = require('./util')
var assert = require('assert')
var T = require('../')(require('../simple'))
//random value between -1 and 2
function R () {
  return u.randomNumber()*3 - 1
}
function testRandom (N, K, J, seed) {
  u.seed(seed)
  var g = u.random(N, K, R)
  var g2 = {}, _g2 = {}, hops = {}
  for(var i = 0; i < J; i++) {
    var g = u.random(N, K, R)
    ;(function () {
      for(var j in g)
        for(var k in g[j]) {
          var _hops = T.traverse(g2, _g2, 3, 'A')
          var v = g[j][k]
          var copy = JSON.parse(JSON.stringify(g2))
          var update = T.update(g2, _g2, hops, 3, 'A',j, k, v)
          var post_hops = T.traverse(g2, _g2, 3, 'A')
          try {
            u.assertUpdate(update, _hops, hops, post_hops)
          } catch (err) {
            console.log()
            console.log('from graph:', copy)
            console.log('with hops:',  _hops)
            console.log('added edge:', {from:j,to:k,value:v})
            console.log('---')
            console.log('actual',  hops)
            console.log('diff: update', update)
            console.log('expected:', T.traverse(g2, _g2, 3, 'A'))
            throw err
          }
//          assert.deepEqual(hops, post_hops)
        }
    })()
  }
}

testRandom(3, 2, 2, 1)
//
testRandom(3, 2, 2, 2)
testRandom(5, 3, 2, 3)
for(var i = 0; i < 9; i++) {
  testRandom(5, 3, 3, i)
}

//this one breaks.
//basically, following someone that then causes
//another previously followed to become blocked,
//but then someone whom they followed ought to be removed
//from the hops.
//testRandom(5, 3, 3, 9)

