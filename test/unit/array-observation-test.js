'use babel';

import observe from '../../src/observe';

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
});

function awaitObservation(observation, fn) {
  let disposable = observation.onDidChangeValues((changes) => {
    disposable.dispose();
    fn(changes);
  });
}
