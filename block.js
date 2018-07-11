/*
  val can be:
  0 == same-as
  1 >= hops to
  -1 == block
  -2 <= follow, but ignore their friends *not implemented yet*

or?

  0         == same as
  1         >= hops to
  -1        == block
  [in, out] == follow at distance `in`, but traverse at `out`

states:

  [hops, block_hops, out_hops]

*/

var isArray = Array.isArray

function toHops(val) {
  return isArray(val) ? val[0] : null
}

function fromHops(val) {
  return isArray(val) ? (val.length === 3 ? val[2] : val[0]) : null
}

function blockHops (val) {
  return isArray(val) ? val[1] : null
}

function add (src, val) {
  return src == null ? val : val + src
}

function min(a, b) {
  return (
    a == null ? b
  : b == null ? a
  : a < b     ? a
  :             b
  )
}

exports.add = function (src, val) {
  if(!src) throw new Error('src must be provided')
  if(val >= 0) {
    return [
      add(fromHops(src), val),
      null,
      add(fromHops(src), val)
    ]
  }
  else if (val == -1) {
    return [null, toHops(src), null]
  }
  else if(val == -2) {
    return [add(fromHops(src), 1), null, -1]
  }
  else
    throw new Error('invalid val:'+val)
}

function equal (a, b) {
  return (
    (a == null) === (b == null)
    && (
      a && b &&
      toHops(a)    == toHops(b) &&
      blockHops(a) == blockHops(b) &&
      fromHops(a)  == fromHops(b)
    )
  )
}

exports.min = function (a, b) {
  return [
    min(toHops(a), toHops(b)),
    min(blockHops(a), blockHops(b)),
    min(fromHops(a), fromHops(b))
  ]
}

exports.reduce = function (src, dst, val) {
//  if(src[0] >= src[1]) //blocked!
//    return null
//
  return exports.min(exports.add(src, val), dst)
}


exports.isUpdate = function (_dst, dst) {
  return !equal(_dst, dst)
}

function asNumber (n) {
  return n == null ? Infinity : n
}
exports.isExpand = function (src, max) {
  console.log("isExpand?", src, max, blockHops(src), (
    toHops(src) < max &&
    asNumber(toHops(src)) <= asNumber(blockHops(src)) &&
    blockHops(src) != 0
  ))
  return (
    toHops(src) < max &&
    asNumber(toHops(src)) <= asNumber(blockHops(src)) &&
    blockHops(src) != 0
  )
}
exports.initial = function () {
  return [0, null, 0]
}
exports.isRemove = function (value, _value) {
  return value >= 0 ? value > _value : value <= -1
}
exports.isCloser = function (value, _value) {
  return value >= 0 ? value > _value : value <= -1
}

