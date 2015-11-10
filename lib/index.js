var store = require('./storage');
var elements = require('./elements');
var uuid = require('./uuid');
var set = require('./set');
var clone = require('./clone');
var merge = require('./merge');
var _ = require('./comprehensions');
var send = require('./send');
var tagSet = require('./tag-set.js');
var url = require("url");

var _jtr = window.jtr || [];
var _deviceToken = null;
var console = window.console || {
  log: function() {}
};
var eventsRemoteUrl = elements.getAttr(document.documentElement, "data-jtr-events-url") || "https://event-stream.journey-app.io/events";


function deviceToken() {
  if(_deviceToken === null) {
    _deviceToken = elements.getAttr(document.documentElement, "data-jtr-device-token");
  }
  return _deviceToken;
}

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

function clearQueue() {
  store.removeItem("jtr_q");
}

function sendEvents() {
  var events = store.getItem("jtr_q");
  if( !events || !events.length) { return; }

  var data = {
    "token": deviceToken(),
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

// adding user traits without messing around the identity
// this function ignores null and undefined input
function userTraits(traits) {
  if(!traits) {
    return;
  }

  var oldUser = store.getItem("jtr_user");
  if(!oldUser) {
    store.setItem("jtr_user", {'traits': traits});
    pushEvent({'type': 'identify', 'traits': traits});
    return;
  }

  var user = {
    'uid': oldUser.uid,
    'traits': merge(oldUser.traits || {}, traits)
  };

  if(JSON.stringify(oldUser) !== JSON.stringify(user)) {
    store.setItem("jtr_user", user);
    pushEvent({'type': 'identify',
               'traits': user.traits});
  }
}

// to identify a user or add traits to user.
// note 1: traits change is additive, you can never remove a value
// note 2: you can unidentify a session by passing a null for uid
// examples:
// * identify user
//  jtr.identify("foo@bar.com");
// * identify user with traits
//  jtr.identify("foo@bar.com", { company_name: 'acem' });
// * unidentify a sesssion and start a new tracking session
//  jtr.identify(null);
function identify(userId, traits) {
  if(userId === null) {
    store.removeItem("jtr_user");
    userTraits(traits);
    return;
  }

  var oldUser = store.getItem("jtr_user");
  if(!oldUser || oldUser.uid !== userId) {
    store.setItem("jtr_user", {'uid': userId, 'traits': traits});
    pushEvent({'type': 'identify', 'traits': traits});
    return;
  }

  userTraits(traits);
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
  'userTraits': userTraits,
  'clearQueue': clearQueue,
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
