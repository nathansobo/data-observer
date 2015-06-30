'use babel';

import SegmentTree from './segment-tree';

export default class ArrayPatch {
  constructor() {
    this.segmentTree = new SegmentTree();
  }

  splice(spliceStart, removedCount, addedCount) {
    let startIterator = this.segmentTree.buildIterator();
    let endIterator = this.segmentTree.buildIterator();
    startIterator.insert(spliceStart, false);
    endIterator.insert(spliceStart + removedCount, true);
    // let prefix = startIterator.splitLeft();
    // let suffix = endIterator.splitRight();
    // this.segmentTree = SegmentTree.join(prefix, suffix);
    endIterator.updateOutputIndex(addedCount - removedCount);
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
    } while (!iterator.next().done)

    return changes;
  }
}
