'use babel';

import observe from '../../src/observe';

describe('ArrayObservation', () => {
  var observation;
  var observedArray;
  var referenceArray;

  function awaitObservedChanges(fn) {
    let disposable = observation.onDidChange((changes) => {
      disposable.dispose();
      for (let {index, removedCount, addedCount} of changes) {
        let spliceArgs = [index, removedCount].concat(observedArray.slice(index, index + addedCount))
        referenceArray.splice.apply(referenceArray, spliceArgs);
      }
      fn();
    });
  }

  it('summarizes disjoint splices on the array', (done) => {
    observedArray = ['a', 'b', 'c', 'd', 'e'];
    referenceArray = observedArray.slice();
    observation = observe(observedArray);

    awaitObservedChanges(() => {
      expect(referenceArray).to.eql(observedArray);
      done();
    });

    observedArray.splice(1, 1, 'f', 'g');
    observedArray.splice(4, 1, 'h', 'i');
  });
});
