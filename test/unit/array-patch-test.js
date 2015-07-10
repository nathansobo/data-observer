'use babel';

import ArrayPatch from '../../src/array-patch';

describe('ArrayPatch', () => {
  let patch, output, input;

  beforeEach(() => {
    patch = new ArrayPatch();
    output = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    input = output.slice();
  });

  function verifyPatch(patch, input, output) {
    for (let {index, removedCount, addedCount} of patch.getChanges()) {
      input.splice(index, removedCount, ...output.slice(index, index + addedCount));
    }
    expect(input).to.eql(output);
  }

  it('has no changes initially', () => {
    expect(patch.getChanges()).to.eql([]);
  });

  it('supports disjoint splices', () => {
    output.splice(2, 2, 'h');
    patch.splice(2, 2, 1);

    output.splice(4, 1, 'i', 'j');
    patch.splice(4, 1, 2);

    verifyPatch(patch, input, output);
  });

  it('supports overlapping splices', () => {
    output.splice(2, 1, 'h', 'i', 'j');
    patch.splice(2, 1, 3);

    output.splice(4, 1, 'k', 'l');
    patch.splice(4, 1, 2);

    verifyPatch(patch, input, output);
  });
});
