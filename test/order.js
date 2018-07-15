
var tape = require('tape')
var opts = require('../simple')

var inputs = [1, -1, 0, 0.1, -0.1, 2, -2]

tape('min is the same in each order', function (t) {
  for(var i = 0; i < inputs.length; i++) {
    for(var j = 0; j < inputs.length; j++)
      t.equal(
        opts.min(inputs[i], inputs[j]), 
        opts.min(inputs[j], inputs[i])
      )
  }
  t.end()
})

tape('action by self', function (t) {

  t.equal(opts.add(0, 1), 1)
  t.equal(opts.add(0, -1), -1)
  t.equal(opts.add(0, 0), 0.1)
  t.equal(opts.add(0, 2), 2)

  t.end()
})

tape('action by self same-as', function (t) {

  t.equal(opts.add(0.1, 1), 1.1)
  t.equal(opts.add(0.1, -1), -1.1) //should this be -1.1?
  t.equal(opts.add(0.1, 0), 0.2)
  t.equal(opts.add(0.1, 2), 2.1)

  t.end()
})

tape('action by friend', function (t) {
  t.equal(opts.add(1, 1), 2)
  t.equal(opts.add(1, -1), -2) //should this be -1.1?
  t.equal(opts.add(1, 0), 1.1)
  t.equal(opts.add(1, 2), 3)

  t.end()
})

tape('action by blocked', function (t) {
  //we ignore what blocked feeds think
  t.equal(opts.add(-1, 1), null)
  t.equal(opts.add(-1, -1), null) //should this be -1.1?
  t.equal(opts.add(-1, 0), null) //should this also be blocked?
  t.equal(opts.add(-1, 2), null)

  t.end()
})


