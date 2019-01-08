var RNG = require('rng')
var mt = new RNG.MT()
var assert = require('assert')
function toLetter (n) {
  return String.fromCodePoint('A'.codePointAt(0)+(n%26)) + (n > 26 ? Math.floor(n / 26) : '')
}
//reseed the random number generator
exports.seed = function (seed) {
  mt = new RNG.MT(seed)
}
exports.randomNumber = function () {
  return mt.random()
}

exports.arrayDist = function (dist) {
  return function () {
    return dist[~~(mt.random()*dist.length)]
  }
}

exports.random = function random (N, k, dist) {
  if(Array.isArray(dist)) dist = exports.arrayDist(dist)
  var g = {}

  for(var i = 0; i < N; i++) {
    for(var j = 0; j < k; j++) {
      //connect from previous set,
      var a = toLetter(~~(mt.random()*N))
      var b
      while((b = toLetter(~~(mt.random()*N))) == a)
        ;
      g[a] = g[a] || {}
      g[a][b] = dist()
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
  edges.sort(function () { return mt.random() - 0.5 })
  var g2 = {}
  edges.forEach(function (e) {
    g2[e.from] = g2[e.from] || {}
    g2[e.from][e.to] = e.value
  })
  return g2

}

function randomKey (o) {
  var keys = Object.keys(o)
  return keys[~~(mt.random()*keys.length)]
}
exports.randomEdge = function (g) {
  var from = randomKey(g)
  return {from: from, to: randomKey(g[from])}
  
}
exports.randomNode = randomKey

exports.assertUpdate = function assertUpdate(diff, hops_pre, hops, after_hops) {
  if(diff == null) {
    for(var k in hops_pre)
      assert.equal(hops[k], hops_pre[k], 'key:'+k+' did not change')
    for(var k in hops)
      assert.equal(hops[k], hops_pre[k], 'key:'+k+' did not change')
    return
  }

  for(var k in hops_pre)
    if(hops[k] == hops_pre[k]) {
      assert.ok(!Object.hasOwnProperty.call(diff, k), 'if no change, not present in diff')
    }
    else {
      assert.equal(diff[k], hops[k], 'diff is equal to new value:'+JSON.stringify([k, diff[k], hops[k]]))
    }
  for(var k in hops)
    if(hops_pre[k] == null)
      assert.equal(diff[k], hops[k], 'diff is equal to new value after edge added')

  if(after_hops) {
    for(var k in after_hops)
      assert.equal(hops[k], after_hops[k], 'expected '+k+'='+after_hops[k]+' but was:'+hops[k])
    for(var k in hops)
      if(after_hops[k] !== hops[k])
        assert.fail('had extra field:'+k+'='+hops[k])
  }
}

