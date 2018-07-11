var assert = require('assert')
function toLetter (n) {
  return String.fromCodePoint('A'.codePointAt(0)+(n%26)) + (n > 26 ? Math.floor(n / 26) : '')
}

function random (N, k, dist) {

  var g = {}

  for(var i = 0; i < N; i++) {
    for(var j = 0; j < k; j++) {
      //connect from previous set,
      var a = toLetter(~~(Math.random()*N))
      var b = toLetter(~~(Math.random()*N))
      g[a] = g[a] || {}
      g[a][b] = dist[~~(Math.random()*dist.length)]
    }
  }

  return g

}

var N = 1000
for(var i = 0; i < N; i++) {

  var g = random(5,3, [1, 1, 1, 0, -1])

  var T = require('../')(require('../simple'))

  try {
    T.traverse(g, T.reverse(g), 3, 'A')
  } catch(err) {
    console.log(g)
    throw err
  }

  function eachEdge (g, each) {
    for(var j in g)
      for(var k in g[j])
        each(j, k, g[j][k])
  }

  var edges = []
  eachEdge(g, function (j,k,v) {
    edges.push({from: j, to:k, value:v})
  })
  edges.sort(function () { return Math.random() - 0.5 })
  var g2 = {}
  edges.forEach(function (e) {
    g2[e.from] = g2[e.from] || {}
    g2[e.from][e.to] = e.value
  })

  try {
    assert.deepEqual(
      T.traverse(g, T.reverse(g), 3, 'A'),
      T.traverse(g2, T.reverse(g2), 3, 'A')
    )
  } catch(err) {
    console.log('var g = ', g)
    console.log('var g2 =', g2)
    throw err
  }
}




