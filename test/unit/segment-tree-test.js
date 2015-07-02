'use babel';

import Random from 'random-seed';
import SegmentTree from '../../src/segment-tree';

describe('SegmentTree', () => {
  let randomSeed;

  describe('insert', () => {
    it('inserts a segment boundary at the given index', () => {
      tree = new SegmentTree();

      tree.buildIterator().insert(5);
      tree.buildIterator().insert(10);
      tree.buildIterator().insert(7);

      let iterator = tree.buildIteratorAtStart();
      expect(iterator.getOutputStart()).to.equal(0);
      expect(iterator.getOutputEnd()).to.equal(5);

      expect(iterator.next().done).to.be.false;
      expect(iterator.getOutputStart()).to.equal(5);
      expect(iterator.getOutputEnd()).to.equal(7);

      expect(iterator.next().done).to.be.false;
      expect(iterator.getOutputStart()).to.equal(7);
      expect(iterator.getOutputEnd()).to.equal(10);

      expect(iterator.next().done).to.be.true;
    });

    it('maintains insertion indices after rebalancing', () => {
      let indices, tree;

      for (var i = 0; i < 1; i++) {
        global.debug = false
        indices = []
        randomSeed = Date.now();
        let random = new Random(randomSeed);
        tree = new SegmentTree(randomSeed)

        for (var j = 0; j < 100; j++) {
          let index = random(200);
          if (indices.indexOf(index) === -1) {
            indices.push(index);
          }
          tree.buildIterator().insert(index);

          validateTree();
        }
      }

      function validateTree() {
        indices.sort((a, b) => a - b);

        let iterator = tree.buildIteratorAtStart();

        for (var i = 0; i < indices.length; i++) {
          if (i > 0 && iterator.getOutputStart() !== indices[i - 1]) {
            throw new Error(`Expected ${iterator.getOutputStart()} to be ${indices[i - 1]}. Seed: ${randomSeed}`);
          }
          if (iterator.getOutputEnd() !== indices[i]) {
            throw new Error(`Expected ${iterator.getOutputEnd()} to be ${indices[i]}. Seed: ${randomSeed}`);
          }
          iterator.next()
        }
      }
    });
  });

  describe('splitLeft', () => {
    it('returns a tree that is upper-bounded by the iterator\'s current node', () => {
      let originalTree = new SegmentTree();

      originalTree.buildIterator().insert(5);
      originalTree.buildIterator().insert(10);
      let splitIterator = originalTree.buildIterator();
      splitIterator.insert(7);
      let leftTree = splitIterator.splitLeft();

      let leftTreeIterator = leftTree.buildIteratorAtStart();
      expect(leftTreeIterator.getOutputStart()).to.equal(0);
      expect(leftTreeIterator.getOutputEnd()).to.equal(5);

      leftTreeIterator.next();
      expect(leftTreeIterator.getOutputStart()).to.equal(5);
      expect(leftTreeIterator.getOutputEnd()).to.equal(7);

      expect(leftTreeIterator.next().done).to.be.true;

      // original tree becomes the right tree
      // nodes to the left of split point are removed
      let rightTreeIterator = originalTree.buildIteratorAtStart();
      expect(rightTreeIterator.getOutputStart()).to.equal(0)
      expect(rightTreeIterator.getOutputEnd()).to.equal(10)

      expect(rightTreeIterator.next().done).to.be.true;
    });
  });
});

function saveHTML(object, identifier='') {
  let fs = require('fs');

  let path = __dirname + '/../../test-output' + identifier + '.html';
  console.log('saving to', path);
  fs.writeFileSync(path, object.toHTML(), 'utf8');
}
