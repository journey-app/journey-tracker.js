module.exports = exports = {
  curryRight: function(fn, args) {
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
    };
  },

  K: function(a) {
    return a;
  }
};
