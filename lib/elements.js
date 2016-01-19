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
var fn = require('./fn');
var _ = require('./comprehensions');

var elements = module.exports = exports = {
  findAllWithAttribute: function(attributeName, attributeValue) {
    if(document.querySelectorAll) {
      return document.querySelectorAll("[" + attributeName + "=\"" + attributeValue + "\"]");
    } else {
      return _.filter(document.getElementsByTagName("*"), function(ele) {
        return elements.getAttr(ele, attributeName) === attributeValue;
      });
    }
  },

  show: function(element, display) {
    element.style.display = display || 'block';
  },

  hide: function(element) {
    element.style.display = 'none';
  },

  eventSrc: function(evt) {
    return evt.srcElement || evt.target;
  },

  collect: function(element, collector) {
    var rets = [];
    var cursor = element;
    while(cursor && cursor !== document) {
      rets.push(collector.apply(cursor, [cursor]));
      cursor = cursor.parentNode;
    }
    return rets;
  },

  getAttr: function(element, attr) {
    return element.getAttribute(attr);
  },

  getCanonicalUrl: function() {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      if (elements.getAttr(links[i], "rel") === "canonical") {
        return elements.getAttr(links[i], "href");
      }
    }
  },

  role: function(element) {
    var explictRole = elements.getAttr(element, "analytics-role") || elements.getAttr(element, "role");
    if(explictRole) {
      return explictRole;
    }
    var tag = element.tagName.toLowerCase();
    if (tag === "a") {
      return "link";
    }

    if (tag === "textarea") {
      return "textbox";
    }

    if (tag === "input") {
      var type = elements.getAttr(element, "type");
      if(type === "submit") {
        return "button";
      }

      if(type === "checkbox") {
        return "checkbox";
      }

      if(type === "radio") {
        return "radio";
      }

      if(type === "file") {
        return "file upload";  //not a standard arial role
      }

      return "textbox";
    }

    return tag;
  }
};

elements.path = fn.curryRight(elements.collect, fn.K);
