
var T = require('../')(require('../simple'))
var random = require('./util').random
var shuffle = require('./util').shuffle

var assert = require('assert')

function clean(o) {
  for(var k in o)
    if(o[k] == null)
      delete o[k]
}

var problem = {
  I: {
    M: 2
  },
  M: { I: 1 },

  F: { D: -1, L: 0, S: -1, N: 0 },
  A: {
    D: 0,
    K: 2
  },
  D: { T: 0 },
  K: { I: 1 },
  T: { K: -1 },
}
console.log(T.reverse(problem))
var hops = T.brute(problem, T.reverse(problem), 3, 'A', 1000)
console.log(hops)

//return
var tape = require('tape')
var N = 10, M = 1
for(var i = 0; i < N; i++) {
  var g = random(20, 3, [1,1,2,0,-1])
  var hops = T.brute(g, T.reverse(g), 3, 'A', 1000)
  console.log('---')
  for(var j = 0; j < M; j++) {
    var g2 = shuffle(g)
    try {
      assert.deepEqual(clean(hops), clean(T.brute(g2, T.reverse(g2), 3, 'A')))
    } catch (err) {
      console.log(g)
      console.log(T.reverse(g))
      throw err
    }
  }
}
console.log('consistent')
//return
//bench

;(function () {
  var N = 100000
  var edges = 0
  var g = random(500, 100, [1,1,2,0,-1])
  var start = Date.now()
  for(var k in g) {
    for(var j in g[k]) {
      edges ++
    }
  }

  var start = Date.now()
  var _g = T.reverse(g)
  for(var i = 0; i < N; i++) {
    var hops = T.brute(g, _g, 3, 'A')
//    console.log('h', Date.now() - start)
    if((Date.now() - start) > 1000) break;
  }
  var time = (Date.now() - start)
  console.log('edges/ms', edges/time, i, time, edges, global.R)

})()


