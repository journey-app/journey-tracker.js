/***************************************************************************
 * Copyright 2015 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **************************************************************************/

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
