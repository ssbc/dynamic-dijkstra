//what happens when you block a same-as
module.exports =  {
  min: function (a, b) {
    if(a == null) return b
    if(b == null) return a
    if(Math.abs(a) == Math.abs(b)) return a < 0 || b < 0 ? Math.abs(a) * -1 : Math.abs(a)
    return Math.abs(a) < Math.abs(b) ? a : b
  },
  add: function (a, v) {
    if(a < 0) return null
    v = v || 0.1
    if(v >= 0) return a >= 0 ? a + v : a - v
    else       return a >= 0 ? a*-1 - 1 : a
  },
  initial: function () {
    return 0
  },
  expand: function (v, max) {
    return v >= 0 && v < max
  }
}









