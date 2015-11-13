var expect = require('chai').expect;
var merge = require('../../lib/merge');


describe("merge", function() {
  it("should combine two obj", function() {
    expect(merge({a: 1}, {b: 2})).to.eql({a:1, b:2});
  });

  it("should override same key in left with right", function() {
    expect(merge({a: 1}, {a: 2})).to.eql({a:2});
  });

  it("should return left when right is not set", function() {
    expect(merge({a: 1})).to.eql({a:1});
    expect(merge({a: 1}, null)).to.eql({a:1});
  });

  it("should return right when left is not set", function() {
    expect(merge(undefined, {a: 1})).to.eql({a:1});
    expect(merge(null, {a: 1})).to.eql({a:1});
  });

  it("should return left if both not set", function() {
    expect(merge(undefined, undefined)).to.eql(undefined);
    expect(merge(null, null)).to.eql(null);
    expect(merge(null, undefined)).to.eql(null);
    expect(merge(undefined, null)).to.eql(undefined);
  });

});
