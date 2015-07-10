module.exports = function() {
  global.expect = global.chai.expect;
  global.assert = global.chai.assert;

  beforeEach(function() {
    this.sandbox = global.sinon.sandbox.create();
    global.stub = this.sandbox.stub.bind(this.sandbox);
    global.spy  = this.sandbox.spy.bind(this.sandbox);
  });

  afterEach(function() {
    delete global.stub;
    delete global.spy;
    this.sandbox.restore();
  });

  function awaitObservation(observation, fn) {
    let disposable;
    let listener = (changes) => {
      disposable.dispose();
      fn(changes);
    };

    if (typeof observation.onDidChangeValue === 'function') {
      disposable = observation.onDidChangeValue(listener);
    } else if (typeof observation.onDidChangeValues === 'function') {
      disposable = observation.onDidChangeValues(listener);
    } else {
      throw new Error("Not an observation");
    }
  }

  global.awaitObservation = awaitObservation;
};
