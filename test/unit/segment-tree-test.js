import Random from 'random-seed';
import SegmentTree from '../../src/segment-tree';

describe('SegmentTree', () => {
  let randomSeed, tree;

  beforeEach(() => {
    randomSeed = Date.now();
    tree = new SegmentTree(randomSeed);
  });

  describe('insert', () => {
    it('inserts a segment boundary at the given index', () => {
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
      let random = new Random(randomSeed);

      let indices = [];

      for (var i = 0; i < 50; i++) {
        let index = random(200);
        if (indices.indexOf(index) === -1) {
          indices.push(index);
        }
        tree.buildIterator().insert(index);

        if (i === 2) {
          saveHTML(tree);
        }

        validateTree()
      }

      function validateTree() {
        indices.sort((a, b) => a - b);
        let iterator = tree.buildIteratorAtStart();
        for (var i = 0; i < indices.length; i++) {
          if (i > 0) {
            expect(iterator.getOutputStart()).to.equal(indices[i - 1]);
          }
          expect(iterator.getOutputEnd()).to.equal(indices[i]);
          iterator.next()
        }
      }
    });
  });
});

function saveHTML(object) {
  let fs = require('fs');

  console.log('saving to', __dirname + '/../../test-output.html');
  fs.writeFileSync(__dirname + '/../../test-output.html', object.toHTML(), 'utf8');
}
