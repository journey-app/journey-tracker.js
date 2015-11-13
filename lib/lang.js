module.exports = exports = {
  isArray: function(something) {
    return Object.prototype.toString.call(something) === "[object Array]";
  },

  isString: function(something) {
    return (typeof something === 'string' || something instanceof String);
  }
};
