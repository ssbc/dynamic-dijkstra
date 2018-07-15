var assert = require('assert')
var random = require('./util').random
var shuffle = require('./util').shuffle

function sort (o) {
  var _o = {}
  Object.keys(o).sort(function (a, b) {
    return o[a] - o[b]
  }).forEach(function (k) {
//    if(o[k] >= 0)
      _o[k] = o[k]
  })
  return _o
}

var N = 1000, M = 10
for(var i = 0; i < N; i++) {
  for(var j = 0; j< M; j++) {
    var g = random(5+j,3, [1, 1, 1, 0, -1])

    var T = require('../')(require('../simple'))

    try {
      T.traverse(g, T.reverse(g), 3, 'A')
    } catch(err) {
      console.log(g)
      throw err
    }

    var g2 = shuffle(g)
    try {
      assert.deepEqual(
        sort(T.traverse(g, T.reverse(g), 3, 'A')),
        sort(T.traverse(g2, T.reverse(g2), 3, 'A'))
      )
    } catch(err) {
      console.log('var g = ', g)
      console.log('var g2 =', g2)
      throw err
    }
  }
}

