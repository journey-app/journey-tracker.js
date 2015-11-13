var expect = require('chai').expect;
var lang = require('../../lib/lang.js');


describe("lang", function() {
  it("can tell array or not", function() {
    expect(lang.isArray([])).to.be.true;
    expect(lang.isArray([1,2,3])).to.be.true;
    expect(lang.isArray("")).to.be.false;
    expect(lang.isArray(null)).to.be.false;
    expect(lang.isArray()).to.be.false;
  });

  it("can tell string or not", function() {
    expect(lang.isString("")).to.be.true;
    expect(lang.isString("sde se")).to.be.true;
    expect(lang.isString(new String("sss"))).to.be.true;
    expect(lang.isString([])).to.be.false;
    expect(lang.isString(null)).to.be.false;
    expect(lang.isString()).to.be.false;
  });

});
