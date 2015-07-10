'use babel';

import Random from 'random-seed';
import SegmentTree from '../../src/segment-tree';

describe('SegmentTree', () => {
  let randomSeed;

  describe('insert', () => {
    it('inserts a segment boundary at the given index', () => {
      let tree = new SegmentTree();

      tree.insertNode(5);
      tree.insertNode(10);
      tree.insertNode(7);

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

      for (var i = 0; i < 10; i++) {
        indices = []
        randomSeed = Date.now();
        let random = new Random(randomSeed);
        tree = new SegmentTree(randomSeed)

        for (var j = 0; j < 100; j++) {
          let index = random(200);
          if (indices.indexOf(index) === -1) {
            indices.push(index);
          }
          let node = tree.insertNode(index);
          node.priority = tree.generateRandom();
          tree.bubbleNodeUp(node);

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
});

function saveHTML(object, identifier='') {
  let fs = require('fs');

  let path = __dirname + '/../../test-output' + identifier + '.html';
  console.log('saving to', path);
  fs.writeFileSync(path, object.toHTML(), 'utf8');
}
