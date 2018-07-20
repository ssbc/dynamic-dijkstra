
var edges = require('./edges.json')
var pull = require('pull-stream')

var me = "@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519"

pull(
  pull.values(edges),
  require('./stream')()
)


