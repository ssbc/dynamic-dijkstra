function toLetter (n) {
  return String.fromCodePoint('A'.codePointAt(0)+(n%26)) + (n > 26 ? Math.floor(n / 26) : '')
}

exports.arrayDist = function (dist) {
  return function () {
    return dist[~~(Math.random()*dist.length)]
  }
}

exports.random = function random (N, k, dist) {
  if(Array.isArray(dist)) dist = exports.arrayDist(dist)
  var g = {}

  for(var i = 0; i < N; i++) {
    for(var j = 0; j < k; j++) {
      //connect from previous set,
      var a = toLetter(~~(Math.random()*N))
      var b
      while((b = toLetter(~~(Math.random()*N))) == a)
        ;
      g[a] = g[a] || {}
      g[a][b] = dist()//dist[~~(Math.random()*dist.length)]
    }
  }

  return g

}

exports.shuffle = function (g) {
  var g2 = {}
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
  return g2

}

function randomKey (o) {
  var keys = Object.keys(o)
  return keys[~~(Math.random()*keys.length)]
}
exports.randomEdge = function (g) {
  var from = randomKey(g)
  return {from: from, to: randomKey(g[from])}
  
}
exports.randomNode = randomKey

