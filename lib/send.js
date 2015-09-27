/* module for cross domain data sending via cors xhr or jsonp */
var cors = require('has-cors');
var jsonp = require('jsonp');
var _ = require('./comprehensions');

function urlEncode(data) {
  return _.map(Object.keys(data), function(key) {
    return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
  }).join("&");
}

function xhrBased(url, data, callback) {
  var http = new XMLHttpRequest();
  http.open("POST", url, true);
  http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  http.send(urlEncode(data));
  http.onreadystatechange = function() {
    if (http.readyState === 4) {
      if ( http.status !== 200 && http.status !== 201 ) {
        return callback("code " + http.status);
      }
      callback(null, {
        url: url,
        body: http.responseText
      });
    }
  };
}

function jsonpBased(url, data, callback) {
  url += '?' + urlEncode(data);
  jsonp(url, { param: "callback" }, function(err, obj){
    if (err) { return callback(err); }
    callback(null, {
      url: url,
      body: obj
    });
  });
}

exports = module.exports = cors
  ? xhrBased
  : jsonpBased;
