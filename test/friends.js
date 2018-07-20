
var friends = require('./data.json')
var pull = require('pull-stream')
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

function eachEdge (g, iter) {
  for(var j in g)
    for(var k in g[j])
      iter(j,k,g[j][k])
}

var reorder = []
eachEdge(g, function (j,k,v) {
  reorder.push({from:j,to:k,value:v})
})
//reorder.sort(function () { return Math.random() - 0.5 }).forEach(function (edge) {
//  onEdge(edge.from, edge.to, edge.value)
//})
//
pull(
  pull.values(reorder),
  require('./stream')()
)
