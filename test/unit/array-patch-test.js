'use babel';

import Random from 'random-seed';
import ArrayPatch from '../../src/array-patch';

describe('ArrayPatch', () => {
  let patch, output, input;

  beforeEach(() => {
    patch = new ArrayPatch();
    output = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    input = output.slice();
  });

  function verifyPatch(patch, input, output, randomSeed) {
    for (let {index, removedCount, addedCount} of patch.getChanges()) {
      input.splice(index, removedCount, ...output.slice(index, index + addedCount));
    }

    let message = 'input and output arrays to be equal';
    if (randomSeed) {
      message += ` (random seed: ${randomSeed})`;
    }
    assert.deepEqual(input, output, message);
  }

  it('has no changes initially', () => {
    assert.deepEqual(patch.getChanges(), []);
  });

  it('supports disjoint splices', () => {
    output.splice(2, 2, 'h');
    patch.splice(2, 2, 1);

    output.splice(4, 1, 'i', 'j');
    patch.splice(4, 1, 2);

    assert.deepEqual(patch.getChanges(), [
      {index: 2, removedCount: 2, addedCount: 1},
      {index: 4, removedCount: 1, addedCount: 2}
    ]);
  });

  it('supports overlapping splices', () => {
    output.splice(2, 1, 'h', 'i', 'j');
    patch.splice(2, 1, 3);

    output.splice(4, 1, 'k', 'l');
    patch.splice(4, 1, 2);

    assert.deepEqual(patch.getChanges(), [{index: 2, removedCount: 1, addedCount: 4}]);
  });

  it('supports insertions', () => {
    output.splice(2, 0, 'h', 'i');
    patch.splice(2, 0, 2);
    assert.deepEqual(patch.getChanges(), [{index: 2, removedCount: 0, addedCount: 2}]);
  });

  it('supports randomized splices', () => {
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    for (var i = 0; i < 100; i++) {
      let randomSeed = Date.now();
      let patch = new ArrayPatch(randomSeed);
      let random = new Random(randomSeed);
      let output = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      let input = output.slice();

      for (var j = 0; j < 500; j++) {
        let index = random(output.length);
        let removedCount = random(output.length - index);
        let addedCount = random(10);
        let added = [];
        for (var k = 0; k < addedCount; k++) {
          added.push(alphabet[random(alphabet.length)]);
        }

        output.splice(index, removedCount, ...added);
        patch.splice(index, removedCount, addedCount);
      }

      verifyPatch(patch, input.slice(), output, randomSeed);
    }
  });
});
