import observe from '../../src/observe';

describe('ArrayObservation', () => {
  it('summarizes disjoint splices on the array', (done) => {
    let array = ['a', 'b', 'c', 'd', 'e'];
    let observation = observe(array);

    let disposable = observation.onDidChange((change) => {
      expect(change).to.eql([
        {index: 1, removed: ['b'], addedCount: 2},
        {index: 4, removed: ['d'], addedCount: 2}
      ]);
      disposable.dispose();
      done();
    });

    array.splice(1, 1, 'f', 'g');
    array.splice(4, 1, 'h', 'i');
  });
});
