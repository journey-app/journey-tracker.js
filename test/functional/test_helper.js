// global helper, mocking, stubbing for all javascript unit tests

jasmine.Ajax.install();

var deviceToken = "j.token";
document.documentElement.setAttribute('data-jtr-device-token', deviceToken);

function expectIdentifyEventSent(uid, traits) {
  var events = eventsSent();
  var theEvent = events[events.length - 1];
  expect(theEvent.type).toBe('identify');
  expect(theEvent.id).not.toBeNull();
  expect(theEvent.uid).toBe(uid);
  expect(theEvent.traits).toEqual(traits);
}

function expectTrackEventSent(verifies) {
  var events = eventsSent();
  var theEvent = events[events.length -1];
  expect(theEvent.type).toBe('track');
  for(var prop in verifies) {
    if(verifies.hasOwnProperty(prop)) {
      expect(theEvent[prop]).toEqual(verifies[prop]);
    }
  }
}

function eventsSent() {
  var request = jasmine.Ajax.requests.mostRecent();
  if(!request) {
    return [];
  }
  expect(request.url).toBe("https://event-stream.journey-app.io/events");
  var data = request.data();
  expect(data.token).toEqual([deviceToken]);
  return JSON.parse(data.events[0]);
}
