var expect = require('chai').expect;
var rp = require('../../lib/random-pick.js');

describe("random-pick", function() {
  it("should be fair for all list members", function() {
    var n = 100000;
    var tolerance = 0.01;
    var counters = {1: 0, 2:0, 3:0};

    for(var i=0; i<n; i++) {
      counters[rp([1,2,3])] += 1;
    }

    expect(counters[1] + counters[2] + counters[3]).to.eql(n);
    expect(Math.abs(counters[1] - counters[2])).to.be.below(n * tolerance);
    expect(Math.abs(counters[2] - counters[3])).to.be.below(n * tolerance);
    expect(Math.abs(counters[3] - counters[1])).to.be.below(n * tolerance);
  });
});
