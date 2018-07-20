
var problem = require('./problem.json')

var tape = require('tape')
var T = require('../')(require('../simple'))
tape('replay problem', function (t) {
  delete problem.graph[problem.edge.from][problem.edge.to]
  var hops = T.traverse(problem.graph, null, problem.max, problem.start)
  t.deepEqual(problem.hops, hops)
  T.update(
    problem.graph, T.reverse(problem.graph), hops, problem.max, problem.start,
    problem.edge.from,
    problem.edge.to,
    problem.edge.value
  )
//  console.log(problem, hops[problem.edge.to])
  var _hops = T.traverse(problem.graph, null, problem.max, problem.start)
  t.deepEqual(hops, _hops)
  t.end()
})




