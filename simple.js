//what happens when you block a same-as
module.exports =  {
  min: function (a, b) {
    if(a == null) return b
    if(Math.abs(a) == Math.abs(b)) return a < 0 || b < 0 ? Math.abs(a) * -1 : Math.abs(a)
    return Math.abs(a) < Math.abs(b) ? a : b
  },
  add: function (a, v) {
    v = v || 0.1
    if(v >= 0) return a >= 0 ? a + v : a - v
    else       return a >= 0 ? ~a : a
  },
  initial: function () {
    return 0
  },
  expand: function (v, max) {
    return v >= 0 && v < max
  }
}









