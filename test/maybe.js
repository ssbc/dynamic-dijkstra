var deepEqual = require('deep-equal')
var u = require('./util')
var tape = require('tape')
var opts = require('../simple')
var assert = require('assert')
var T = require('../')(opts)
var max = 3
var LOG

function clean(post_hops, _g2, start) {
  for(let k in post_hops) {
    if(k != start) {
      let h = null
      for(let j in _g2[k]) {
        let v = _g2[k][j]
     //   console.log(h, post_hops[j], v)
        if(post_hops[j] != null)
          h = h == null ? opts.add(post_hops[j], v) : opts.min(h, opts.add(post_hops[j], v))
      }
      if(!h) post_hops[k] = null
    }
  }
  return post_hops
}

function R () {
  return u.randomNumber()*3 - 1
}
var failed = 0, seeds = [], maybies = 0, partials = 0, output = {}
function testRandom (N, K, J, seed) {
  u.seed(seed)
  var g = u.random(N, K, R)
  var g2 = {}, _g2 = {}, hops = {}
  for(var i = 0; i < J; i++) {
    var g = u.random(N, K, R)
    ;(function () {
      for(var j in g)
        for(var k in g[j]) {
            let type = 0
            var v = g[j][k]
            var _hops = T.traverse(g2, null, max, 'A')
            var maybe = T.maybe(g2, _hops, max, j)
            var copy = u.clone(g2)
            g2[j] = g2[j] || {}
            _g2[k] = _g2[k] || {}
            let _v = g2[j][k] || null
            g2[j][k] = v
            _g2[k][j] = v
            var partial = T.partial(g2, _hops, max, j)

            var hops = T.traverse(g2, null, max, 'A')
            var diff = {}
            for(let k in hops)
              if(_hops[k] != hops[k])
                diff[k] = hops[k]
            //nodes removed
            for(let k in _hops)
              if(hops[k] == null)
                diff[k] = null

            var post_hops = u.clone(_hops)
            for(let k in partial) post_hops[k] = partial[k]
            post_hops = clean(post_hops, _g2, 'A')

//            var post_hops2 = u.clone(_hops)
//            for(let k in diff) post_hops2[k] = diff[k]
//            assert.deepEqual(post_hops2, diff)

            var partial_ok = deepEqual(diff, partial)
            var maybe_ok = true
            for(let k in diff)
              if(maybe[k] == null)
                maybe_ok = false
            var clean_ok = deepEqual(hops, post_hops)

            if(v > 0 && _v > 0) { //excludes null
              type = v < _v ? 'closer' : 'further'
            }
            else if(v > 0 && _v == null)
              type = 'invite'
            else if(v <= 0 && _v == null)
              type = 'disinvite'
            else if(v > 0 && _v <= 0) {
              type = 'unblock'
            }
            else if(v <= 0 && _v > 0) //<= includes null
              type = 'block'
            else if(v <= 0 && _v <= 0)
              type = 'reblock'
            else
              throw new Error('what type? v='+v+',_v='+_v)

            if(_v == null && copy[j])
              type += '-merge'

            for(let k in partial)
              if(partial[k] < 0) {
                type += '-B'; break;
              }
            for(let k in partial)
              if(partial[k] > 0 && partial[k] > _hops[k]) {
                type += '-F'; break;
              }
            for(let k in partial)
              if(partial[k] > 0 && partial[k] < _hops[k]) {
                type += '-UF'; break;
              }
            for(let k in partial)
              if(_hops[k] < 0 && partial[k] > 0) {
                type += '-unblock'; break;
              }

            output[type] = output[type] || {
              type: type,
              partial: 0, maybe: 0, clean: 0, total: 0, seeds: []
            }

            if(maybe_ok)
              output[type].maybe ++
            if(partial_ok)
              output[type].partial ++
            if(clean_ok)
              output[type].clean ++

            if(!maybe_ok && !partial_ok)
              output[type].seeds.push(seed)

            output[type].total ++

            if(output[type].partial == output[type].total)
              output[type].okay = 'partial'
            else if(output[type].maybe == output[type].total)
              output[type].okay = 'maybe'
            else {
              output[type].okay = 'BRUTE'
              if(LOG) {
                console.log({
                  graph: copy,
                  edge: {from: j, to: k, value: v},
                  before: _hops,
                  after: hops,
                  post: post_hops,
                  diff: diff,
                  partial: partial,
                  maybe: maybe,
                })
              }
            }
        }
    })()
  }
}

//in all three, we are following "A" who is blocking "B",
//but then we block "A" and but since "C" follows "B" they are now in range.
//testRandom(4, 2, 1, 1686)
//testRandom(4, 2, 1, 3029)
//testRandom(4, 2, 1, 3114)
//testRandom(4, 2, 1, 9999)

//
//search for failing seeds. only found 3/10000!
//for(var i = 1; i < 10000; i++)
//  testRandom(4, 2, 1, i)
var seed = +process.argv[2]

if(seed) {
  LOG = true
  testRandom(5, 2, 2, seed)
}
else {
  for(var i = 1; i <= 1000; i++)
    testRandom(5, 2, 2, i)

  var sum = {}, wrong = 0, wrong_maybe = 0, total = 0, brute = {}
  for(let type in output) {
    sum[output[type].okay] = (sum[output[type].okay] || 0) + output[type].total
    total += output[type].total
    wrong += output[type].total - output[type].partial
    wrong_maybe += output[type].total - output[type].maybe
    if(output[type].okay === 'BRUTE') {
      brute[type] = output[type].total - output[type].partial
    }
  }

  console.log(output)
  console.log(sum, wrong, total)
  console.log(brute)
}


