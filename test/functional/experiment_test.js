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

  it("should keep the same group info when identify already identified", function() {
    jtr.identify("bob");
    var assigned = jtr.experimentGroup("exp-11", ["control", "variant"]);

    jtr.identify("johon");
    jtr.experimentGroup("exp-11", ["control", "variant"]);

    expect(jtr.userTraits("exp-11")).toBe(assigned);
  });

  it("can specify an group by passing in the third arg", function() {
    for(var i=0; i<100; i++) {
      expect(jtr.experimentGroup("exp-11", ["control", "variant"], "variant")).toBe("variant");
      expect(jtr.userTraits("exp-11")).toBe("variant");
    }
  });

  it("can force an group", function() {
    jtr.experimentGroup("exp-11", ["control", "variant"], "variant")
    var changedTo = jtr.experimentGroup("exp-11", ["control", "variant"], "control")
    expect(changedTo).toBe("control")
    expect(jtr.userTraits("exp-11")).toBe("control");
  });

  describe("ui effects", function() {
    var fixture = '<div id="control-div" analytics-experiment="exp-11" analytics-experiment-group="control"></div>' +
'<div id="variant-div" analytics-experiment="exp-11" analytics-experiment-group="variant"></div>' +
'<div id="normal-div"></div>';
    var control, variant, normal;

    beforeEach(function() {
      document.body.insertAdjacentHTML(
        'afterbegin',
        fixture);
      control = document.getElementById("control-div");
      variant = document.getElementById("variant-div");
      normal = document.getElementById("normal-div");
    });

    it("should show/hide elements  match/notmatch current group", function() {
      jtr.experimentGroup("exp-11", ["control", "variant"], "variant");
      expect(control.style.display).toBe('none');
      expect(variant.style.display).toBe('block');
      expect(normal.style.display).toBe('');
    });

    it("should use display attributes upon show element", function() {
      control.setAttribute("analytics-experiment-display", "inline");
      jtr.experimentGroup("exp-11", ["control", "variant"], "control");
      expect(control.style.display).toBe('inline');
      expect(variant.style.display).toBe('none');
    });

    // todo:
    // it("should use default display style base element tag on showing", function() {
    //   document.body.insertAdjacentHTML(
    //     'afterbegin',
    //     '<span id="span" analytics-experiment="exp-11" analytics-experiment-group="control"></span>')
    //   jtr.experimentGroup("exp-11", ["control", "variant"], "control");
    //   expect(document.getElementById('span').style.display).toBe('inline');
    // });

  });
});
