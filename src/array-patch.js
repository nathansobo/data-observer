'use babel';

import SegmentTree from './segment-tree';

export default class ArrayPatch {
  constructor(randomSeed) {
    this.segmentTree = new SegmentTree(randomSeed);
  }

  splice(spliceStart, removedCount, addedCount) {
    this.segmentTree.splice(spliceStart, removedCount, addedCount);
  }

  getChanges() {
    let changes = [];
    let iterator = this.segmentTree.buildIteratorAtStart();

    do {
      if (iterator.inChange()) {
        changes.push({
          index: iterator.getOutputStart(),
          removedCount: iterator.getInputEnd() - iterator.getInputStart(),
          addedCount: iterator.getOutputEnd() - iterator.getOutputStart()
        });
      }
    } while (!iterator.next().done);

    return changes;
  }
}
