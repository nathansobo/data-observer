export default class ArrayPatch {
  constructor() {
    this.segmentTree = new SegmentTree();
    this.removed = {};
  }

  splice(spliceStart, removed, addedCount) {
    // Create a start iterator and seek it to the start of the splice.
    let startIterator = new ArrayPatchIterator(this);
    startIterator.seek(spliceStart);

    // Create an end iterator and advance it to the end of the splice, one
    // segment at a time. When skipping over non-change segments, we store
    // the removed values based on their location in the original array.
    let endIterator = startIterator.clone();
    let spliceEnd = spliceStart + removed.length;
    while (endIterator.getOutputIndex() < spliceEnd) {
      let inChange = endIterator.inChange()
      let inputIndex = endIterator.getInputIndex();
      let outputIndex = endIterator.getOutputIndex();

      if (endIterator.getSegmentOutputEnd() > spliceEnd) {
        endIterator.seek(spliceEnd);
      } else {
        endIterator.next();
      }

      if (!inChange) {
        let segmentOutputEnd = endIterator.getOutputIndex();
        while (outputIndex < segmentOutputEnd) {
          this.removed[inputIndex] = removed[outputIndex - spliceStart];
          inputIndex++;
          outputIndex++;
        }
      }
    }

    // Now cut out any segment boundaries between the start and end iterators.
    startIterator.deleteBoundariesUntil(endIterator);

    // Finally, update the output index of the end iterator based on the number
    // of elements that were added or removed by the splice.
    endIterator.updateOutputIndex(addedCount - removed.length);
  }

  getChanges() {
    let changes = [];
    let iterator = this.segmentTree.segments();
    iterator.seek(0);
    while (true) {
      let inChange = iterator.inChange();
      let inputStart, outputStart;
      if (inChange) {
        inputStart = iterator.getInputIndex();
        outputStart = iterator.getOutputIndex();
      }

      if (iterator.next().done) {
        return changes;
      }

      if (inChange) {
        let inputEnd = iterator.getInputIndex();
        let outputEnd = iterator.getOutputIndex();

        let removed = [];
        for (var inputIndex = inputStart; inputIndex < inputEnd; inputIndex++) {
          removed.push(this.removed[inputIndex])
        }

        changes.push({
          index: outputStart,
          removed: removed,
          addedCount: outputEnd - outputStart
        });
      }
    }
  }
}

class SegmentTree {
  constructor() {
    this.root = null;
  }
}
