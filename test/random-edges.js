
var edges = require('./edges.json')
var pull = require('pull-stream')

var me = "@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519"

var ordered = {}, count = 0, queue = []
edges.forEach(function (e) {
  count ++
  var a = ordered[e.from] = (ordered[e.from] || [])
  e.seq = ordered[e.from].length
  queue.push(e.from)
  a.push(e)
})

queue.sort(function () { return Math.random() - 0.5 })
var i = 0

pull(
  function (abort, cb) {
    if(count-->0) cb(null, ordered[queue[i++]].shift())
    else          cb(true)
  },
  require('./stream')()
)




















