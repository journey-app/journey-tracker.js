var fn = require('./fn');

var elements = module.exports = exports = {
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

  getLocationDescriptor: function (element) {
    var cssClass = elements.getAttr(element, "class");
    var id = elements.getAttr(element, "id");
    var descriptor = element.tagName;
    if(id) {
      descriptor += "#" + id.toLowerCase();
    }
    if (cssClass) {
      descriptor += "." + cssClass.toLowerCase();
    }
    return descriptor;
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
