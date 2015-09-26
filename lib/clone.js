module.exports = exports = function(obj) {
  if(typeof obj === "undefined" || obj === null) {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
};
