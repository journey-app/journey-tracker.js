var store = require('./storage');
var elements = require('./element');
var uuid = require('./uuid');
var set = require('./set');
var clone = require('./clone');
var _ = require('./comprehensions');

var _jtr = window.jtr || [];
var deviceToken = elements.getAttr(document.documentElement, "data-jtr-device-token");
var console = window.console || {
  log: function() {}
};
var eventsRemoteUrl = elements.getAttr(document.documentElement, "data-jtr-events-url") || "https://event-stream.journey-app.io/events";

function anonymousId() {
  var id = store.getItem("jtr_anonymous_id");
  if (id) {
    return id;
  }
  store.setItem("jtr_anonymous_id", uuid());
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
  _.each(events, function(event) {
    idset[event.id] = event;
  });
  var queue = store.getItem("jtr_q");

  store.setItem("jtr_q", _.compact(_.map(queue, function(event) {
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
        clearEvents(_.filter(events, function(event) {
          return event.type === "track";
        }));
        return;
      }
      clearEvents(events);
    }
  };
}

function pushEvent(event) {
  event.id = uuid();
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

function tagSet(eles) {
  if(typeof eles === "undefined" || eles === null) {
    return set.empty();
  }

  if (eles === "*" ) {
    return set.all();
  }

  return set.make(_.map(eles, function(tag) {
    return tag.toLowerCase();
  }));
}

function trackInteraction(eventName, elementTags, excludeElements, preventRepeative) {
  var includes = tagSet(elementTags);
  var excludes = tagSet(excludeElements);
  var lastTriggerElement;

  document.addEventListener(eventName, function(event) {
    var srcElement = elements.eventSrc(event);
    if(!srcElement) { return; }
    var path = elements.path(srcElement);
    for(var i = 0; i < path.length; i++) {
      var element = path[i];
      var tagname = element.tagName.toLowerCase();
      if(includes.includes(tagname) && !excludes.includes(tagname)) {
        var label = elements.getAttr(element, "analytics-label");
        if(label) {
          if(preventRepeative && lastTriggerElement === element) {
            break;
          }
          lastTriggerElement = element;
          var eventDesc = eventName + "|" + label + "|" + elements.role(element);
          track(eventDesc, {
            '_locator': elements.getLocationDescriptor(element)
          });
          break;
        }
      }
    }
  }, true);
}

var jtr = module.exports = exports = {
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
_.each(_jtr, function(args) {
  var fn = args.shift();
  jtr[fn].apply(jtr, args);
});
