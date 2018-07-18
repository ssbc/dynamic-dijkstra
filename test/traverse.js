var opts = require('../simple')
var T = require('../')(opts)

var tape = require('tape')

// work with old tests: remove blocked feeds.
// (keep blocked peers in the data structure for now)

function down (o) {
  var _o = {}
  for(var k in o)
    if(o[k] >= 0)
      _o[k] = ~~(o[k])
  return _o
}

tape('simple', function (t) {
  var g = {
    A: {B: 1},
    B: {C: 1}
  }
  var hops = {A: 0, B: 1, C: 2}

  t.deepEqual(
    T.traverse(g, T.reverse(g), 3, 'A'),
    hops
  )

  t.end()
})

tape('chain with remove', function (t) {
  var g = {
    A: {B: 1},
    B: {C: 1}
  }
  var hops = {A: 0, B: 1, C: 2}

  t.deepEqual(
    T.traverse(g, T.reverse(g), 3, 'A'),
    hops
  )

  g.A = {C:1}

  t.deepEqual(
    T.traverse(g, T.reverse(g), 3, 'A'),
    {A:0, C: 1}
  )

  t.end()
})

tape('non-order dependant', function (t) {
  var g = {
    A: { B: 1, C: 0 },
    B: {D: 1},
    C: {D: 0}
  }
  var hops = T.traverse(g, T.reverse(g), 3, 'A')
  t.deepEqual(
    down(hops),
    {A: 0, B:1, C: 0, D: 0}
  )

  g.C = {}

  hops = T.traverse(g, T.reverse(g), 3, 'A')

  t.deepEqual(
    down(hops),
    {A: 0, B:1, C: 0, D: 2}
  )

  g.C.D = -1

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 1, C: 0}
  )

  g.D = {E: 1, F: 1}

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 1, C: 0}
  )


  t.end()
})


tape('non-order dependant', function (t) {
  var g = {
    A: { C: 0, B: 1},
    B: {D: 1},
    C: {D: 0}
  }
  var hops = T.traverse(g, T.reverse(g), 3, 'A')
  t.deepEqual(
    down(hops),
    {A: 0, B:1, C: 0, D: 0}
  )

  g.C = {}

  hops = T.traverse(g, T.reverse(g), 3, 'A')

  t.deepEqual(
    down(hops),
    {A: 0, B:1, C: 0, D: 2}
  )

  g.C.D = -1

//  T.add(g, T.reverse(g), 3, hops, 'C', 'D', -1)

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 1, C: 0}
  )

  g.D = {E: 1, F: 1}

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 1, C: 0}
  )

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 4, 'A')),
    {A: 0, B: 1, C: 0}
  )

  t.end()
})



tape('loop', function (t) {
  var g = {
    A: { B: 1},
    B: {C: 1},
    C: {A: 1}
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 1, C: 2}
  )

  t.end()

})

tape('same-as loop', function (t) {
  var g = {
    A: { B: 0},
    B: {C: 0},
    C: {A: 0}
  }


  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 0, C: 0}
  )
  t.end()
})

tape('same-as loop, with device-blocks self', function (t) {
  var g = {
    A: { B: 0},
    B: {C: 0},
    C: {A: -1}
  }


  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 0, C: 0}
  )
  t.end()
})

tape('same-as loop, with a block to another device', function (t) {
  var g = {
    A: { B: 0},
    B: {C: 0},
    C: {B: -1}
  }


  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 0, C: 0}
  )
  t.end()
})

tape('same-as loop, with a block 2nd device', function (t) {
  var g = {
    A: { B: -1, C: 0},
    B: {C: 0},
    C: {B: 0}
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, B: 0, C: 0}
  )
  t.end()
})


tape('same-as loop, with a block', function (t) {
  var g = {
    A: { B: -1, C: 0},
    B: {},
    C: {B: 1}
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 0}
  )
  t.end()
})

tape('same-as blocks a friend', function (t) {
  //same as is -0.1 block 
  var g = {
    A: { C: 0, B: 1},
    C: {B: -1}
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 0, B: 1}
  )
  t.end()
})

tape('same-as blocks a same-as friend', function (t) {
  //same as is -0.1 block 
  var g = {
    A: { C: 0, B: 0},
    B: {D: 1},
    C: {D: -1},
  }

  //D:1.1 and -1.1 and 1.1 wins
  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 0, B: 0, D: 1}
  )
  t.end()
})

// a "distant follow". replicate them, but not their friends.
tape('friend blocks an aquaitance', function (t) {
  //same as is -0.1 block 
  var g = {
    A: { C: 1, B: 2},
    B: {},
    C: {B: -1},
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 1, B:2}
  )
  t.end()
})

tape('same-as\'s friend blocks an aquaitance', function (t) {
  //same as is -0.1 block 
  var g = {
    A: { D: 0, B: 2},
    B: {},
    D: { C: 1},
    C: {B: -1},
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 1, D: 0, B: 2}
  )
  t.end()
})


tape('friend blocks a friend', function (t) {
  var g = {
    A: { C: 1, B: 1},
    B: {},
    C: {B: -1}
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 1, B: 1}
  )
  t.end()
})

tape('friend blocks a foaf', function (t) {
  var g = {
    A: { C: 1, B: 1},
    B: {D: 1},
    C: {D: -1}
  }

  t.deepEqual(
    down(T.traverse(g, T.reverse(g), 3, 'A')),
    {A: 0, C: 1, B: 1, D: 2}
  )
  t.end()
})

tape('remove ', function (t) {
  var g = {
    A: { B: 1, C: 1 },
    C: { D: 1, B: 1 },
    D: { E: 0 },
    E: { D: 0 }
  }
  var hops = T.traverse(g, null, 3, 'A')
  t.deepEqual(
    hops,
    {A: 0, B: 1, C: 1, D: 2, E: 2.1}
  )

  T.update(g, T.reverse(g), hops, 3, 'A',
    //C blocks D, which should also remove E, but not B.
    'C', 'D', -1
  )
  console.log(hops)
  t.deepEqual(hops, T.traverse(g, null, 3, 'A'))
  t.end()
})



return
tape('remove ', function (t) {
  var g = {
    A: { B: 1, C: 1 },
    C: { D: 1, B: 1 },
    B: { E: 2 }, //this causes distance to E to just increase
    D: { E: 0 },
    E: { D: 0 }
  }
  var hops = T.traverse(g, null, 3, 'A')
  t.deepEqual(
    hops,
    {A: 0, B: 1, C: 1, D: 2, E: 2.1}
  )

  T.update(g, T.reverse(g), hops, 3, 'A',
    //C blocks D, which means length to E is now 3 (via B)
    'C', 'D', -1
  )
  console.log(hops)
  t.deepEqual(hops, T.traverse(g, null, 3, 'A'))
  t.end()
})




