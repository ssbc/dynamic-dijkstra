//what happens when you block a same-as

function min (a, b) {
    if(a == null) return b
    if(b == null) return a
    if(Math.abs(a) == Math.abs(b)) {
      return a > b ? a : b
    }
    return Math.abs(a) < Math.abs(b) ? a : b
  }
module.exports =  {
  lt: function (a, b) {
    if(a < 0) return false
    if(a < b) return true
  },
  min: function (a, b) {
    if(min(a,b) != min(b, a)) throw new Error('min not associative:'+a+','+b)
    return min(a, b)
  },
  add: function (a, v) {
    if(a < 0) return null
    v = v || 0.1
    if(v >= 0) return a >= 0 ? a + v : a - v
    else       return a >= 0 ? a*-1 + v : a
  },
  initial: function () {
    return 0
  },
  expand: function (v, max) {
    return v >= 0 && v < max
  },
  isAdd: function (v) {
    return v >= 0
  },
  isRemove: function (v) {
    return v < 0
  }
}














