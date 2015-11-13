describe('identify', function() {
  beforeEach(function() {
    jasmine.Ajax.requests.reset();
    jtr._clear();
  });

  it("should send out identify event after identify an anonymous user", function() {
    jtr.identify("foo@bar.com");
    expectIdentifyEventSent("foo@bar.com", undefined);
  });

  it("should set correct uid for all the following tracking event", function() {
    jtr.identify("foo@bar.com");
    jtr.track("did-x");
    expectTrackEventSent({ name: 'did-x', uid: 'foo@bar.com'});
  });

  it("should send out traits on identify", function() {
    jtr.identify("someone", {"company_size": "small"});
    expectIdentifyEventSent("someone", {"company_size": "small"});
  });

  it("should not send duplicate identify", function() {
    jtr.identify("someone", {"company_size": "small"});
    jtr.identify("someone", {"company_size": "small"});
    expect(eventsSent().length).toBe(1);

    jtr.identify("someone", {"industry": "IT"});
    expect(eventsSent().length).toBe(2);
  });

  it("traits add should be additive", function() {
    jtr.identify("someone", {"company_size": "small"});
    jtr.identify("someone", {"industry": "IT"});
    expectIdentifyEventSent("someone", {"industry": "IT", "company_size": "small"});
  });

  it("should merge traits from anonymous user", function() {
    jtr.identify(null, {"company_size": "small"});
    jtr.identify("dude-b", {"industry": "IT"});
    expectIdentifyEventSent("dude-b", {"company_size": "small", "industry": "IT"});
  });

  it("should not merge traits from different user", function() {
    jtr.identify("dude-a", {"company_size": "small"});
    jtr.identify("dude-b", {"industry": "IT"});
    expectIdentifyEventSent("dude-b", {"industry": "IT"});
  });

  it("should unidentifiy session if uid is null", function() {
    jtr.identify("someone", {"company_size": "small"});
    jtr.track("did-x");
    var originalAnonymousId = _.last(eventsSent()).anonymousId

    jtr.identify(null);
    jtr.track("did-y");

    expectTrackEventSent({ name: 'did-y', uid: null});
    expect(_.last(eventsSent()).anonymousId).toEqual(originalAnonymousId);
  });

  it("should set traits to new anonymous user with null uid and traits defined", function() {
    jtr.identify("someone", {"company_size": "small"});
    jtr.track("did-x");
    var originalAnonymousId = _.last(eventsSent()).anonymousId

    jtr.identify(null, {"company_size": "big"});
    jtr.track("did-y");

    var events = eventsSent(),
    trackEvent = events.pop(),
    identifyEvent = events.pop();

    expect(trackEvent.uid).toBe(null);
    expect(trackEvent.anonymousId).toEqual(originalAnonymousId);

    expect(identifyEvent.type).toBe("identify");
    expect(identifyEvent.traits).toEqual({"company_size": "big"});
    expect(identifyEvent.anonymousId).toEqual(originalAnonymousId);
  });

});
