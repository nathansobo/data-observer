import ArrayPatch from '../../src/array-patch';

describe('ArrayPatch', () => {
  let patch, output, input;

  beforeEach(() => {
    patch = new ArrayPatch();
    output = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    input = output.slice();
  });

  function verifyPatch(patch, input, output) {
    for (let {index, removed, addedCount} of patch.getChanges()) {
      input.splice(index, removed, ...output.slice(index, index + addedCount));
    }
    expect(input).to.eql(output);
  }

  it('has no changes initially', () => {
    expect(patch.getChanges()).to.eql([]);
  });

  it.only('supports disjoint splices', () => {
    let removed = output.splice(2, 2, 'h');
    patch.splice(2, removed, 1);
    verifyPatch(patch, input, output);
  });
});
