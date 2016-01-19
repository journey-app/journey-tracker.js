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
