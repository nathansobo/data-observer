'use babel';

import observe from '../../src/index';
import {awaitObservation} from '../setup/test-helpers';

describe('ArrayObservation', () => {
  it('invokes listeners when the array changes', (done) => {
    let observedArray = ['a', 'b', 'c', 'd', 'e'];

    awaitObservation(observe(observedArray), (changes) => {
      expect(changes).to.eql([
        {index: 1, removedCount: 1, added: ['f', 'g']},
        {index: 4, removedCount: 1, added: ['h', 'i']}
      ]);
      done();
    });

    observedArray.splice(1, 1, 'f', 'g');
    observedArray.splice(4, 1, 'h', 'i');
  });

  describe('.prototype.map(fn)', () => {
    it('applies a transform function over the values of the array', (done) => {
      let observedArray = ['a', 'b', 'c', 'd', 'e'];
      let observation = observe(observedArray).map(value => value.toUpperCase());

      expect(observation.getValues()).to.eql(['A', 'B', 'C', 'D', 'E']);

      awaitObservation(observation, (changes) => {
        expect(changes).to.eql([
          {index: 1, removedCount: 1, added: ['F', 'G']},
          {index: 4, removedCount: 1, added: ['H', 'I']}
        ]);
        done();
      });

      observedArray.splice(1, 1, 'f', 'g');
      observedArray.splice(4, 1, 'h', 'i');
    });
  });
});
