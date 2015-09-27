var set = require('./set');
var _ = require('./comprehensions');

exports = module.exports = function(tags) {
  if(typeof tags === "undefined" || tags === null) {
    return set.empty();
  }

  if (tags === "*" ) {
    return set.all();
  }

  return set.make(_.map(tags, function(tag) {
    return tag.toLowerCase();
  }));

};
