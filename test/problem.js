var opts = require('../simple')
var T = require('../')(opts)
var tape = require('tape')

var min = opts.min
opts.min = function (a, b) {
  if(min(a, b) !== min(b, a))
    throw new Error('detected misorder: min('+a+', '+b+')')
  return min(a, b)
}

var g = {
  C: { E: -1 },
  A: { E: 1 },
  E: { C: 0 },
}

tape('random', function (t) {
  console.log(g)
  console.log(T.reverse(g))
  var hops = T.traverse(g, T.reverse(g), 3, 'A')
  console.log(hops)
  t.end()
})

function eachEdge (g, each) {
  for(var j in g)
    for(var k in g[j])
      each(j, k, g[j][k])
}

function scramble (g) {
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

tape('order', function (t) {
  var g = {
    //D: { B: 1, D: 1, E: 1, C: 1 },
    A: { D: 1, E: 0 },
    E: { D: -1, A: -1 },
    //B: { D: -1 },
    //C: { E: 0, D: 1, C: 1 }
  }

  var g2 = scramble(g)

  console.log(g2)

  t.deepEqual(
    T.traverse(g, T.reverse(g), 3, 'A'),
    T.traverse(g2, T.reverse(g2), 3, 'A')
  )

  var hops = T.traverse(g, T.reverse(g), 3, 'A')
  var _g = T.reverse(g)
  var sum = null
  t.equal(opts.min(-1, 1), opts.min(1, -1))

  t.end()
})

tape('order2', function (t) {
  var g = {
    B: { D: 1 },
    C: { B: -1 },
    A: { B: 1, C: 0 },
  }
  var g2 = {
    A: { C: 0, B: 1 },
    B: { D: 1 },
    C: { B: -1 },
  }

  t.deepEqual(
    T.traverse(g2, T.reverse(g2), 3, 'A'),
    T.traverse(g, T.reverse(g), 3, 'A')
  )
  t.end()


})

tape('order 3', function (t) {
var g =  {
  A: { D: 0, E: 1 },
  D: { E: -1 },
  E: { B: 1, E: -1, D: 1 },
  C: { A: 1, B: 0, E: 1 },
  B: { D: 1, B: 0} }
var g2 = {
  B: { D: 1 , B: 0 },
  C: { E: 1, B: 0, A: 1 },
  D: { E: -1 },
  E: { E: -1, B: 1, D: 1 },
  A: { E: 1, D: 0 } }

  t.deepEqual(
    T.traverse(g2, T.reverse(g2), 3, 'A'),
    T.traverse(g, T.reverse(g), 3, 'A')
  )

  t.end()
})


tape('order 4', function (t) {
  var g = {
    F: {
      I: 0, B: 0},
    A: {
      E: 0, B: 1
    },
    B: { F: 0 },
    E: {
      B: -1
    }
  }

  var g2 = scramble(g)

  t.deepEqual(
    T.traverse(g2, T.reverse(g2), 3, 'A'),
    T.traverse(g, T.reverse(g), 3, 'A')
  )

  t.end()
})

tape('order3', function (t) {
  var g =  {
    A: { F: 1, D: 1, E: 1 },
    G: { J: 0 },
    D: { F: 1, J: -1, A: 1 },
    H: { B: 1, G: 0, D: 1, A: 1, C: 1 },
    C: { H: 1, J: 1, G: 0 },
    E: { A: 1,
      I: -1
    },
    J: { C: 1, F: 1 },
    F: {
      G: 0
    },
  }
  var g2 = {
    E: { A: 1, I: -1 },
    J: { C: 1, F: 1 },
    G: { J: 0 },
    F: { G: 0 },
    A: { E: 1, F: 1, D: 1 },
    C: { H: 1, J: 1, G: 0 },
    D: { F: 1, J: -1, A: 1 },
    H: { A: 1, D: 1, B: 1, G: 0, C: 1 },
  }

  t.deepEqual(
    T.traverse(g2, T.reverse(g2), 3, 'A'),
    T.traverse(g, T.reverse(g), 3, 'A')
  )

  t.end()
})

tape('order4', function (t) {
  var g =  {
    C: { H: 0, E: -1 },
    A: { E: 0, G: 1, F: 0, D: -1 },
    H: { A: 1, G: -1, B: 1 },
    D: { C: -1, K: 1, A: 1, B: -1 },
    E: { B: 1, I: 1, H: 1, J: 0 },
    B: { J: 1, K: 1 },
    K: { G: 1, B: -1, C: 1 },
    I: { G: 1, H: 1, C: 1, A: 1 },
    F: { A: 0 },
    G: { K: 1 },
    J: { C: 0, D: 1, A: 1 }
  }
  var g2 = {
    E: { H: 1, I: 1, B: 1, J: 0 },
    G: { K: 1 },
    A: { F: 0, G: 1, D: -1, E: 0 },
    I: { H: 1, A: 1, C: 1, G: 1 },
    D: { C: -1, B: -1, A: 1, K: 1 },
    H: { G: -1, B: 1, A: 1 },
    J: { A: 1, D: 1, C: 0 },
    K: { C: 1, G: 1, B: -1 },
    C: { E: -1, H: 0 },
    B: { K: 1, J: 1 },
    F: { A: 0 }
  }

  t.deepEqual(
    T.brute(g2, null, 3, 'A'),
    T.traverse(g, null, 3, 'A')
  )
  t.end()
})

tape('remove', function (t) {
  var g =  {
    A: { B: 2, C: 0 },
    D: { C: 2, E: 2, B: 1 },
    B: { E: 2 },
    C: { B: 2, D: 1, E: 2, A: 1 },
    E: { A: 2, D: 2, B: 2, C: 2 }
  }
  var hops = T.traverse(g, null, 3, 'A')
  console.log('hops', hops)
  console.log(g)

  T.update(g, T.reverse(g), hops, 3, 'A', 'C', 'D', -1)
  console.log(g)
  t.deepEqual(hops, T.traverse(g, null, 3, 'A'))
  t.end()
})

function assertUpdate(t, diff, hops_pre, hops) {
  if(diff == null) {
    for(var k in hops_pre)
      t.equal(hops[k], hops_pre[k], 'key did not change')
    for(var k in hops)
      t.equal(hops[k], hops_pre[k], 'key did not change')
    return
  }

  for(var k in hops_pre)
    if(hops[k] == hops_pre[k]) {
      t.ok(!Object.hasOwnProperty.call(diff, k), 'if no change, not present in diff')
    }
    else {
      console.log('hops', diff, hops_pre, hops)
      t.equal(diff[k], hops[k], 'diff is equal to new value:'+JSON.stringify([k, diff[k], hops[k]]))
    }
  for(var k in hops)
    if(hops_pre[k] == null)
      t.equal(diff[k], hops[k], 'diff is equal to new value after edge added')
}

function testIncremental(t, g, j,k,v) {
  var hops = T.traverse(g, null, 3, 'A')
  var _hops = T.traverse(g, null, 3, 'A')
  console.log(g)
  console.log('initial', hops)
  var _g = T.reverse(g)
  var maybe = T.uncertain(g, hops, 3, k)
  console.log(j,k,v)
  console.log(maybe)

  var diff = T.update(g, _g, hops, 3, 'A', j,k,v)
  t.deepEqual(hops, _hops)
  assertUpdate(t, diff, _hops, hops)
}

tape('incremental remove', function (t) {
  var g =  {
    C: { B: 1, A: 2, E: 2, C: -1, D: -1 },
    D: { B: 1, E: 1 },
    E: { C: -1, B: 1 },
    A: { E: 1, B: 1, C: 2 },
    B: { C: 1, E: 0 }
  }
  testIncremental(t, g, 'C', 'E', -1)
  t.end()
})

tape('incremental remove2', function (t) {
  var g =  {
    C: { B: 2, D: 0, A: 1 },
    D: { E: 2, C: 2, B: 2 },
    E: { D: 1, C: 1, B: 1 },
    A: { B: 1, C: 2 },
    B: { A: 1, C: -1 }
  }
  testIncremental(t, g, 'C','C', -1)
  t.end()
})

tape('incremental remove 3', function (t) {
  var g =  { A: { B: 0, D: 1 },
    C: { A: 2, E: 2, D: 1, B: 2 },
    D: { A: 2, B: -1, E: 1 },
    B: { D: 2, E: -1, A: 2 },
    E: { C: 1, D: 1, B: -1 }
  }

  testIncremental(t, g, 'E','B', -1)
  t.end()
})


tape('incremental remove 4', function (t) {
  var g =  {
    B: { C: -1, J: 2, H: 2, E: 2, D: 1 },
    J: { A: 2, C: 1, D: 1, B: -1 },
    I: { E: 1, J: 1, A: 2, G: 2, C: 2 },
    F: { D: 2, G: 2, E: 2, B: 1, H: 2 },
    A: { B: 0, I: 1, D: 1, G: 2, J: 1, E: 0 },
    C: { I: -1, F: 2, H: 1, B: 2, D: 0 },
    G: { J: 1, H: 1, C: 1, B: 1, I: 1, A: 1 },
    E: { H: 1, B: 1 },
    H: { B: 2, J: 1, I: 1 },
    D: { C: 1, J: 2, G: 1 }
  }
  var edge =  { from: 'H', to: 'B', value: -1 }
  testIncremental(t, g, edge.from, edge.to, edge.value)
  t.end()
})


tape('incremental remove 5', function (t) {
  var g =  { J: { I: 1, A: 2, B: -1, C: 2, E: 2, F: 2 },
    A: { G: 2, D: 1, I: 1, F: 2 },
    E: { F: 1, A: 2, B: 2, D: 1, H: 1 },
    G: { H: 1, J: -1, A: 2, B: 1 },
    I: { J: 1, G: 1, H: 2, E: 2, F: 1 },
    H: { C: 1, I: 2, J: 1, A: 2 },
    F: { D: 1, E: 2, H: 2, A: 2, G: 2 },
    C: { I: 2, A: 0, F: 1, J: 1, H: 2, G: 2 },
    B: { E: 2, F: 2, A: 2, C: 0, D: 1, B: -1 },
    D: { A: 0, H: 2, E: 0 } }
  var edge =  { from: 'H', to: 'C', value: -1 }

  testIncremental(t, g, edge.from, edge.to, edge.value)
  t.end()

})

