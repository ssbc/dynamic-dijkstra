var T = require('../')(require('../simple'))

var tape = require('tape')

tape('simple', function (t) {
  var p = 0.1
  var g = {A: {B: p}}
  var _g = T.reverse(g)
  console.log(g, _g)
  var hops = T.traverse(g, _g, 3, 'A')
  t.deepEqual(hops, {A: 0, B:p})
  var diff = T.update(g, _g, hops, 3, 'A', 'A', 'B', 1)
  t.deepEqual(hops, {A: 0, B:1})

  t.end()
})

