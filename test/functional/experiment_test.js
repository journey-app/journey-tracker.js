describe('experiment-groups', function() {
  beforeEach(function() {
    jasmine.Ajax.requests.reset();
    jtr._clear();
  });

  it("should assign a group upon first call and persist it", function() {
    var firstAssignment = jtr.experimentGroup("exp-11", ["control", "variant"])
    expect(["control", "variant"]).toContain(firstAssignment);
    expect(["control", "variant"]).toContain(jtr.experimentGroup("exp-11"));
    for(var i=0; i<100; i++) {
      jtr.experimentGroup("exp-11", ["control", "variant"]);
      expect(jtr.experimentGroup("exp-11")).toEqual(firstAssignment)
    }
  });

  it("should set group info as a user trait", function() {
    var assigned = jtr.experimentGroup("exp-11", ["control", "variant"])
    expect(jtr.userTraits("exp-11")).toBe(assigned);
  });

  it("should trigger identify event once upon assign group", function() {
    var assigned = jtr.experimentGroup("exp-11", ["control", "variant"]);
    jtr.experimentGroup("exp-11", ["control", "variant"]);
    expect(eventsSent().length).toBe(1);
    expectIdentifyEventSent(null, {"exp-11": assigned});
  });

  it("should keep the same group info when identify anonymous user", function() {
    var assigned = jtr.experimentGroup("exp-11", ["control", "variant"]);
    jtr.identify("bob");
    expect(jtr.userTraits("exp-11")).toBe(assigned);
  });
});
