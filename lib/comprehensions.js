module.exports = exports = {
  each: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      fn.apply(array[i], [array[i]]);
    }
  },

  map: function(array, fn) {
    var rets = [];
    for(var i = 0; i < array.length; i++) {
      rets.push(fn.apply(array[i], [array[i]]));
    }
    return rets;
  },

  compact: function(array) {
    var rets = [];
    for(var i = 0; i < array.length; i++) {
      if(array[i]) {
        rets.push(array[i]);
      }
    }
    return rets;
  },

  filter: function(array, fn) {
    var rets = [];
    for(var i = 0; i < array.length; i++) {
      if(fn.apply(array[i], [array[i]])) {
        rets.push(array[i]);
      }
    }
    return rets;
  }
};
