var clone = require('./clone');

module.exports = exports = function(left, right) {
  var result = clone(left);
  for(var property in right) {
    if (right.hasOwnProperty(property)) {
      result[property] = right[property];
    }
  }
  return result;
};
