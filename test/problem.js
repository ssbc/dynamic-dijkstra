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
  console.log(_g.D)
  var sum = null
  console.log('forward:', Object.keys(_g.D).reduce(function (sum, k) {
    return opts.min(sum, opts.add(hops[k], _g.D[k]))
  }, null))
  console.log('reverse:', Object.keys(_g.D).reverse().reduce(function (sum, k) {
    console.log(sum, opts.add(hops[k], _g.D[k]))
    return opts.min(sum, opts.add(hops[k], _g.D[k]))
  }, null))
  t.equal(opts.min(-1, 1), opts.min(1, -1))

  console.log(sum)

  console.log('D', T.recalculate(T.reverse(g), 3, 'D'), 'A')

  t.end()
})

tape('order2', function (t) {
  var g = {
    B: { D: 1 },
    C: { B: -1 },
    A: { B: 1, C: 0 },
  }
//  var g2 = scramble(g)
  var g2 = {
    A: { C: 0, B: 1 },
    B: { D: 1 },
    C: { B: -1 },
  }

  t.equal(
    T.recalculate(T.reverse(g), {A: 0, C: 0.1}, 'D'),
    null
  )
  t.equal(
    T.recalculate(T.reverse(g2), {A: 0, C: 0.1}, 'D'),
    null
  )
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

//  var g2 = {
//    C: { G: 1, E: 0 },
////    F: { G: -1, B: 0, D: -1, C: 1, I: 0, E: 1 },
////    I: { A: 0, D: 1, H: 1 },
////    G: { A: 1, C: 1 },
//    A: { B: 1, E: 0, G: -1 },
////    B: { F: 0, B: 1, G: -1 },
// //   D: { F: 0, G: 1, C: -1 },
//    E: { B: -1 },
// //   H: { A: 1 }
//  }

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

  console.log(T.brute(g2, null, 3, 'A', 0, true))

  t.end()
})

tape('order4', function (t) {
var g =  { C: { H: 0, E: -1 },
  A: { E: 0, G: 1, F: 0, D: -1 },
  H: { A: 1, G: -1, B: 1 },
  D: { C: -1, K: 1, A: 1, B: -1 },
  E: { B: 1, I: 1, H: 1, J: 0 },
  B: { J: 1, K: 1 },
  K: { G: 1, B: -1, C: 1 },
  I: { G: 1, H: 1, C: 1, A: 1 },
  F: { A: 0 },
  G: { K: 1 },
  J: { C: 0, D: 1, A: 1 } }
var g2 = { E: { H: 1, I: 1, B: 1, J: 0 },
  G: { K: 1 },
  A: { F: 0, G: 1, D: -1, E: 0 },
  I: { H: 1, A: 1, C: 1, G: 1 },
  D: { C: -1, B: -1, A: 1, K: 1 },
  H: { G: -1, B: 1, A: 1 },
  J: { A: 1, D: 1, C: 0 },
  K: { C: 1, G: 1, B: -1 },
  C: { E: -1, H: 0 },
  B: { K: 1, J: 1 },
  F: { A: 0 } }

  t.deepEqual(
    T.brute(g2, null, 3, 'A', 0, true),
    T.traverse(g, null, 3, 'A', 0, true)
  )
  t.end()
})
