
var T = require('../')(require('../simple'))
var friends = require('./data.json')
for(var k in friends)
  for(var j in friends[k])
    if(friends[k][j] === true)
      friends[k][j] = 1
    else if(friends[k][j] === false)
      friends[k][j] = -1
    else if(friends[k][j] === null)
      delete friends[k][j]


var me = "@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519"
var start = Date.now()
console.log('start')
var hops = T.brute(friends, T.reverse(friends), 3, me)
console.log({time: Date.now()-start, nodes:Object.keys(hops).length})
//console.log(hops)

var s = Date.now(), e = 0
for(var k in friends)
  for(var j in friends[j])
    e++

console.log({edges:e, time:Date.now()-s})
