console.log("testtt");

import observe from '../../src/observe';

describe('ArrayObservation', () => {
  var observation;
  var observedArray;
  var referenceArray;

  function awaitObservedChanges(fn) {
    let disposable = observation.onDidChange((changes) => {
      disposable.dispose();
      for (let {index, removed, addedCount} of changes) {
        let result = referenceArray.splice(index, removed.length, observedArray.slice(index, index + addedCount));
        expect(result).to.eql(removed);
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
