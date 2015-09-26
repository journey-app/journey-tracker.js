(function(window, document) {
  "use strict";
  function guidv4() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
      s4() + "-" + s4() + s4() + s4();
  }

  // from https://github.com/remy/polyfills
  function cookieStorage (cookieName) {
    function createCookie(name, value, days) {
      var date, expires;
      if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie(name) {
      var nameEQ = name + "=",
      ca = document.cookie.split(";"),
      i, c;

      for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
      return null;
    }

    function setData(data) {
      data = JSON.stringify(data);
      createCookie(cookieName, data, 365);
    }

    function clearData() {
      createCookie(cookieName, "", 365);
    }

    function getData() {
      var data = readCookie(cookieName);
      return data ? JSON.parse(data) : {};
    }

    // initialise if there's already data
    var data = getData();

    return {
      length: 0,

      clear: function () {
        data = {};
        this.length = 0;
        clearData();
      },

      getItem: function (key) {
        return data[key] === undefined ? null : data[key];
      },

      key: function (i) {
        // not perfect, but works
        var ctr = 0;
        for (var k in data) {
          if (ctr === i) {
            return k;
          } else {
            ctr++;
          }
        }
        return null;
      },

      removeItem: function (key) {
        delete data[key];
        this.length--;
        setData(data);
      },

      setItem: function (key, value) {
        data[key] = value + ""; // forces the value to a string
        this.length++;
        setData(data);
      }
    };
  }

  function jsonStore(strStore) {
    return {
      getItem: function(key) {
        var str = strStore.getItem(key);
        if(typeof str === "undefined") {
          return undefined;
        }

        if (str === null) {
          return null;
        }

        return JSON.parse(str);
      },

      setItem: function(key, value) {
        if(value === null) {
          return strStore.setItem(key, null);
        } else {
          return strStore.setItem(key, JSON.stringify(value));
        }
      },

      removeItem: function(key) {
        return strStore.removeItem(key);
      }
    };
  }

  var _jtr = window.jtr || [];
  var deviceToken = document.documentElement.getAttribute("data-jtr-device-token");
  var console = window.console || {
    log: function() {}
  };
  var store = jsonStore(window.localStorage || cookieStorage("jtr_session"));
  var eventsRemoteUrl = document.documentElement.getAttribute("data-jtr-events-url") || "https://event-stream.journey-app.io/events";

  function K(a) {
    return a;
  }

  function clone(obj) {
    if(typeof obj === "undefined" || obj === null) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function curryRight(fn, args) {
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
    };
  }

  function each(array, fn) {
    for(var i = 0; i < array.length; i++) {
      fn.apply(array[i], [array[i]]);
    }
  }

  function set(array) {
    var ret = {};
    each(array, function(element) {
      ret[element] = true;
    });

    return {
      includes: function(element) {
        return ret[element] || false;
      }
    };
  }

  function emptySet() {
    return {
      includes: function() {
        return false;
      }
    };
  }

  function allSet() {
    return {
      includes: function() {
        return true;
      }
    };
  }

  function map(array, fn) {
    var rets = [];
    for(var i = 0; i < array.length; i++) {
      rets.push(fn.apply(array[i], [array[i]]));
    }
    return rets;
  }

  function compact(array) {
    var rets = [];
    for(var i = 0; i < array.length; i++) {
      if(array[i]) {
        rets.push(array[i]);
      }
    }
    return rets;
  }

  function filter(array, fn) {
    var rets = [];
    for(var i = 0; i < array.length; i++) {
      if(fn.apply(array[i], [array[i]])) {
        rets.push(array[i]);
      }
    }
    return rets;
  }

  function eventExtractSrcElement(evt) {
    return evt.srcElement || evt.target;
  }

  function elementCollect(element, collector) {
    var rets = [];
    var cursor = element;
    while(cursor && cursor !== document) {
      rets.push(collector.apply(cursor, [cursor]));
      cursor = cursor.parentNode;
    }
    return rets;
  }

  var elementPath = curryRight(elementCollect, K);

  function elementGetAttr(element, attr) {
    return element.getAttribute(attr);
  }

  function elementGetLocationDescriptor(element) {
    var cssClass = elementGetAttr(element, "class");
    var id = elementGetAttr(element, "id");
    var descriptor = element.tagName;
    if(id) {
      descriptor += "#" + id.toLowerCase();
    }
    if (cssClass) {
      descriptor += "." + cssClass.toLowerCase();
    }
    return descriptor;
  }

  function elementRole(element) {
    var explictRole = elementGetAttr(element, "analytics-role") || elementGetAttr(element, "role");
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
      var type = elementGetAttr(element, "type");
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

  function anonymousId() {
    var id = store.getItem("jtr_anonymous_id");
    if (id) {
      return id;
    }
    store.setItem("jtr_anonymous_id", guidv4());
    return store.getItem("jtr_anonymous_id");
  }

  function currentUID() {
    var user = store.getItem("jtr_user");
    return user ? user.uid : null;
  }

  function sendInPageAnalyticsTrackEvent(event) {
    if(event.type === "identify") {
      return;
    }
    var tail = store.getItem("jtr_tracking_tail") || [];
    tail.unshift(event);
    while (tail.length > 2) {
      tail.pop();
    }
    store.setItem("jtr_tracking_tail", tail);
    var ifr = document.getElementById("_jtr_in_page_analytics");
    if(ifr && ifr.contentWindow && ifr.contentWindow.postMessage) {
      ifr.contentWindow.postMessage(JSON.stringify(tail), "*");
    }
  }


  function clearEvents(events) {
    var idset = {};
    each(events, function(event) {
      idset[event.id] = event;
    });
    var queue = store.getItem("jtr_q");

    store.setItem("jtr_q", compact(map(queue, function(event) {
      return idset[event.id] ? null : event;
    })));
  }

  function sendEvents() {
    var events = store.getItem("jtr_q");
    if( !events || !events.length) { return; }

    var http = new XMLHttpRequest();

    var body = "token=" + encodeURIComponent(deviceToken)
      + "&events=" + encodeURIComponent(JSON.stringify(events));

    http.open("POST", eventsRemoteUrl, true);
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    http.send(body);
    http.onreadystatechange = function() {
      if (http.readyState === 4) {
        if ( http.status !== 200 && http.status !== 201 ) {
          console.log("jtr warning: can not send event, http code: " + http.status);
          clearEvents(filter(events, function(event) {
            return event.type === "track";
          }));
          return;
        }
        clearEvents(events);
      }
    };
  }

  function pushEvent(event) {
    event.id = guidv4();
    event.uid = currentUID();
    event.anonymousId = anonymousId();
    event.at = new Date();

    var queue = store.getItem("jtr_q") || [];
    queue.push(event);
    store.setItem("jtr_q", queue);
    sendInPageAnalyticsTrackEvent(event);
    sendEvents();
  }

  function getCanonicalUrl() {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("rel") === "canonical") {
        return links[i].getAttribute("href");
      }
    }
  }

  function parseUrl(url) {
    var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7]
    };
  }

  function inferPageName() {
    var url = getCanonicalUrl() || window.location.href;
    return parseUrl(url).pathname;
  }

  function page(name, properties) {
    var props = clone(properties) || {};
    if (!name) {
      name = inferPageName();
    }
    props.url = window.location.href;
    props.referrer = document.referrer;
    props.title = document.title;
    var event = {
      'type': 'page',
      'name': "open|" + name + "|page",
      'properties': props
    };
    pushEvent(event);
  }

  function track(action, properties) {
    var event = {'type': 'track',
                 'name': action,
                 'properties': properties
                };
    pushEvent(event);
  }

  function identify(userId, traits) {
    if(userId === null) {
      store.removeItem("jtr_user");
      return;
    }
    var user = { 'uid': userId, 'traits': traits };
    var oldUser = store.getItem("jtr_user");
    if(!oldUser || JSON.stringify(oldUser) !== JSON.stringify(user)) {
      store.setItem("jtr_user", user);
      pushEvent({'type': 'identify',
                 'traits': traits});
    }
  }

  function tagSet(elements) {
    if(typeof elements === "undefined" || elements === null) {
      return emptySet();
    }

    if (elements === "*" ) {
      return allSet();
    }

    return set(map(elements, function(tag) {
      return tag.toLowerCase();
    }));
  }

  function trackInteraction(eventName, elements, excludeElements, preventRepeative) {
    var includes = tagSet(elements);
    var excludes = tagSet(excludeElements);
    var lastTriggerElement;

    document.addEventListener(eventName, function(event) {
      var srcElement = eventExtractSrcElement(event);
      if(!srcElement) { return; }
      var path = elementPath(srcElement);
      for(var i = 0; i < path.length; i++) {
        var element = path[i];
        var tagname = element.tagName.toLowerCase();
        if(includes.includes(tagname) && !excludes.includes(tagname)) {
          var label = elementGetAttr(element, "analytics-label");
          if(label) {
            if(preventRepeative && lastTriggerElement === element) {
              break;
            }
            lastTriggerElement = element;
            var eventDesc = eventName + "|" + label + "|" + elementRole(element);
            track(eventDesc, {
              '_locator': elementGetLocationDescriptor(element)
            });
            break;
          }
        }
      }
    }, true);
  }

  window.jtr = {
    'initialised': true,
    'page': page,
    'track': track,
    'trackInteraction': trackInteraction,
    'identify': identify,
    'noConflict': function() {
      window.jtr = _jtr;
    }
  };

  trackInteraction("click", "*", ["form"]);
  trackInteraction("submit", ["form"]);
  trackInteraction("keypress", ["input"], null, true);

  // processing events left from previous page
  sendEvents();

  // apply queued calls
  each(_jtr, function(args) {
    var fn = args.shift();
    window.jtr[fn].apply(window.jtr, args);
  });

})(window, document);
