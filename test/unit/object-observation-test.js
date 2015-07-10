import observe from '../../src/observe';

describe('ObjectObservation', () => {
  it('invokes listeners when the object changes', (done) => {
    let object = {a: 1, b: 2};
    awaitObservation(observe(object), (value) => {
      expect(value).to.equal(object);
      done();
    });

    object.a = 3;
  });

  it('can observe a single property', () => {
    let object = {a: 1, b: 2};
    let observation = observe(object, 'a');

    expect(observation.getValue()).to.equal(1);

    awaitObservation(observation, (value) => {
      expect(value).to.equal(3);
      done();
    });

    object.a = 3;
  });

  it('can observe multiple properties, combined into a single value with a function', () => {
    let object = {a: 1, b: 2, c: 3};
    let observation = observe(object, 'a', 'b', 'c', (a, b, c) => a + b + c);

    expect(observation.getValue()).to.equal(6);

    awaitObservation(observation, (value) => {
      expect(value).to.equal(9);
      done();
    });

    object.a = 3;
    object.c = 4;
  });
});
