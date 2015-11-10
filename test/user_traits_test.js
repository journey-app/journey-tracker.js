describe('userTraits', function() {
  beforeEach(function() {
    jasmine.Ajax.requests.reset();
    jtr.identify(null);
    jtr.clearQueue();
  });

  it("can set traits to anonymous user", function() {
    jtr.userTraits({"company_size": "small"});
    expectIdentifyEventSent(undefined, {"company_size": "small"});

    jtr.userTraits({"industry": "it"});
    expectIdentifyEventSent(undefined, {"company_size": "small", "industry": "it"});
  });

  it("can set traits to identified user", function() {
    jtr.identify("dude-a");
    jtr.userTraits({"company_size": "small"});
    expectIdentifyEventSent("dude-a", {"company_size": "small"});
  });

  it("can merge traits from a identify call", function() {
    jtr.identify("dude-a", {"industry": "it"});
    jtr.userTraits({"company_size": "small"});
    expectIdentifyEventSent("dude-a", {"company_size": "small", "industry": "it"});
  });

  it("can merge traits from a anonymous identify call", function() {
    jtr.identify(null, {"industry": "it"});
    jtr.userTraits({"company_size": "small"});
    expectIdentifyEventSent(undefined, {"company_size": "small", "industry": "it"});
  });

  it("should ignore undefined traits", function() {
    jtr.userTraits(undefined);
    console.log(eventsSent());
    expect(eventsSent().length).toBe(0);
  });

  it("should not send out duplicate identify events for anonymous user", function() {
    jtr.userTraits({"company_size": "small"});
    jtr.userTraits({"company_size": "small"});
    expect(eventsSent().length).toBe(1);

    jtr.userTraits({"company": "acme"});
    expect(eventsSent().length).toBe(2);
  });

  it("should not send out duplicate identify events for identified user", function() {
    jtr.identify("dude-a");

    jtr.userTraits({"company_size": "small"});
    jtr.userTraits({"company_size": "small"});
    expect(eventsSent().length).toBe(2);

    jtr.userTraits({"company": "acme"});
    expect(eventsSent().length).toBe(3);
  });


});
