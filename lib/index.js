var store = require('./storage');
var elements = require('./elements');
var uuid = require('./uuid');
var set = require('./set');
var clone = require('./clone');
var _ = require('./comprehensions');
var send = require('./send');
var tagSet = require('./tag-set.js');
var url = require("url");

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
  var idSet = set.make(_.map(events, function(event) {
    return event.id;
  }));
  var queue = store.getItem("jtr_q");

  store.setItem("jtr_q", _.compact(_.map(queue, function(event) {
    return idSet.includes(event.id) ? null : event;
  })));
}

function sendEvents() {
  var events = store.getItem("jtr_q");
  if( !events || !events.length) { return; }

  var data = {
    "token": deviceToken,
    "events": JSON.stringify(events)
  };

  send(eventsRemoteUrl, data, function(error) {
    if(error) {
      console.log("[journey-tracker warning] can not send event: " + error);
      clearEvents(_.filter(events, function(event) {
        return event.type === "track";
      }));
      return;
    }
    clearEvents(events);
  });
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

function inferPageName() {
  var urlString = elements.getCanonicalUrl() || window.location.href;
  return url.parse(urlString).pathname;
}

function page(name, properties) {
  var props = clone(properties) || {};
  if (!name) {
    name = inferPageName();
  }
  props.url = window.location.href;
  props.referrer = document.referrer;
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
