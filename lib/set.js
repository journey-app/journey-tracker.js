var _ = require("./comprehensions");

module.exports = exports = {
  make: function(array) {
    var ret = {};
    _.each(array, function(element) {
      ret[element] = true;
    });

    return {
      includes: function(element) {
        return ret[element] || false;
      }
    };
  },

  empty: function() {
    return {
      includes: function() {
        return false;
      }
    };
  },

  all: function() {
    return {
      includes: function() {
        return true;
      }
    };
  }
};
