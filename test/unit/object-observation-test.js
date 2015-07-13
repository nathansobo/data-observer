'use babel';

import observe from '../../src/index';
import {awaitObservation} from '../setup/test-helpers';

describe('ObjectObservation', () => {
  it('invokes listeners when the object changes', (done) => {
    let object = {a: 1, b: 2};
    awaitObservation(observe(object), (value) => {
      expect(value).to.equal(object);
      done();
    });

    object.a = 3;
  });

  it('can observe a single property', (done) => {
    let object = {a: 1, b: 2};
    let observation = observe(object, 'a');

    expect(observation.getValue()).to.equal(1);

    awaitObservation(observation, (value) => {
      expect(value).to.equal(3);
      done();
    });

    object.a = 3;
  });

  it('can observe multiple properties, combined into a single value with a function', (done) => {
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

  it('can observe a whole object and transform its value', () => {
    let object = {a: 1, b: 2};
    let observation = observe(object, o => ({c: o.a + o.b}));
    expect(observation.getValue()).to.eql({c: 3});
  });

  describe('.prototype.map(fn)', (done) => {
    it('applies a transform function over the value of the observation', () => {
      let object = {a: 'a'};
      let observation = observe(object, 'a').map(value => value.toUpperCase());

      expect(observation.getValue()).to.equal('A');

      awaitObservation(observation, (value) => {
        expect(value).to.equal('B');
        done();
      });

      object.a = 'b';
    });
  });
});
