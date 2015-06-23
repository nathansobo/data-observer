export default class ArrayPatch {
  constructor() {
    this.root = new Leaf(Infinity, Infinity);
  }

  // Returns an array of {index, removed, addedCount} objects that combines
  // all splices recorded in the patch.
  getChanges() {
    let iterator = new ArrayPatchIterator(this);
    iterator.seek(0);

    let changes = [];
    while (true) {
      let index = iterator.getOutputIndex();
      let {value, done} = iterator.next();

      if (done) {
        return changes;
      }

      if (value.removed !== undefined) {
        changes.push({index, removed: value.removed, addedCount: value.outputExtent});
      }
    }
  }

  // Record a change into the patch.
  splice(startIndex, removedFromOutput, addedCount) {
    // Seek prefix iterator to beginning of splice.
    let prefixIterator = new ArrayPatchIterator(this);
    prefixIterator.seek(startIndex);

    // Advance suffix iterator to end of splice, building up a new removed
    // elements array based on combining elements removed in this change with
    // elements removed in previous changes that this change happens to intersect.
    let suffixIterator = prefixIterator.clone();
    let endIndex = startIndex + removedFromOutput.length;
    let removedFromInput = [];
    while (true) {
      let {done, value} = suffixIterator.next(endIndex);
      if (done) {
        break;
      } else {
        if (value.removed) {
          removedFromInput = removedFromInput.concat(result.removed);
          removedFromOutput.splice(0, value.outputExtent);
        } else {
          removedFromInput = removedFromInput.concat(removedFromOutput.splice(0, value.outputExtent));
        }
      }
    }

    // Slice off tree's prefix and suffix, then sandwich a new leaf containing
    // the current change between the prefix and the suffix.
    let splicedLeaf = new Leaf(removedFromInput.length, addedCount, removedFromInput);
    let prefixTree = prefixIterator.splitLeft();
    let suffixTree = suffixIterator.splitRight();
    this.root = concatenateTrees(concatenateTrees(prefixTree, splicedLeaf), suffixTree);
  }
}

class ArrayPatchIterator {
  constructor(patch) {
    this.patch = patch;
    this.node = patch.root;
    this.path = [];
    this.nodeInputStart = 0;
    this.nodeOutputStart = 0;
    this.nodeOutputOffset = 0;
    this.done = false;
  }

  clone() {
    let clone = Object.create(ArrayPatchIterator.prototype);
    clone.patch = this.patch;
    clone.node = this.node;
    clone.path = this.path.slice();
    clone.nodeInputStart = this.nodeInputStart;
    clone.nodeOutputStart = this.nodeOutputStart;
    clone.nodeOutputOffset = this.nodeOutputOffset;
    clone.done = this.done;
    return clone;
  }

  getInputIndex() {
    return this.nodeInputStart + Math.min(this.nodeOutputOffset, this.node.inputExtent);
  }

  getOutputIndex() {
    return this.nodeOutputStart + this.nodeOutputOffset;
  }

  inLeaf() {
    return this.node.isLeaf();
  }

  inChange() {
    return this.node.isChange();
  }

  seek(index) {
    this.done = false;

    // ascend until the current node contains the index
    while (!(this.nodeOutputStart <= index && index < (this.nodeOutputStart + this.node.outputExtent))) {
      this.ascend();
    }

    // descend to the leaf containing the index
    descendToLeaf:
    while (!this.inLeaf()) {
      let childInputStart = this.nodeInputStart;
      let childOutputStart = this.nodeOutputStart;

      for (let child of this.node.children) {
        let childInputEnd = childInputStart + child.inputExtent;
        let childOutputEnd = childOutputStart + child.outputExtent;

        if (childOutputStart <= index && index < childOutputEnd) {
          this.descend(child, childInputStart, childOutputStart);
          continue descendToLeaf;
        }

        childInputStart = childInputEnd;
        childOutputStart = childOutputEnd;
      }

      throw new Error('Reached invalid iterator state.');
    }

    // then set the offset in the current node
    this.nodeOutputOffset = index - this.nodeOutputStart;
    if (this.nodeOutputOffset > this.node.outputExtent) {
      throw new Error('Reached invalid iterator state.');
    }
  }

  next(maxIndex) {
    // if we're not pointed at a leaf, we're done advancing
    if (this.done) {
      return {done: true, value: undefined};
    }

    let inputStart = this.getInputIndex();
    let outputStart = this.getOutputIndex();

    // If maxIndex is defined, we won't advance beyond it.
    if (maxIndex !== undefined) {
      // If we're already at or beyond the max index, stop now.
      if (maxIndex <= this.getOutputIndex()) {
        return {done: true, value: undefined};
      }

      // If the next segment starts beyond the max index, advance only partially
      // If the next segment starts beyond the max index, advance only partially
      // through the current node by adjusting the nodeOutputOffset.
      if (maxIndex < (this.nodeOutputStart + this.node.outputExtent)) {
        this.nodeOutputOffset = maxIndex - this.nodeOutputStart;
        let inputExtent = this.getInputIndex() - inputStart;
        let outputExtent = this.getOutputIndex() - outputStart;
        let removed;
        if (this.node.removedElements !== undefined) {
          let sliceIndex = inputStart - this.nodeInputStart;
          removed = this.node.removedElements.slice(sliceIndex, sliceIndex + inputExtent);
        }
        return {
          done: false,
          value: {inputExtent, outputExtent, removed}
        };
      }
    }

    // If we reached this point, maxIndex is either undefined, or greater than
    // the start of the next node, so we can advance to it.

    // Collect the input extent, output extent, and removed elements of the
    // remainder of the leaf we're advancing over (the whole leaf if our
    // nodeOutputOffset is 0). They'll be returned at the end of the method
    // after we advance to the next leaf.
    let nodeInputOffset = Math.min(this.nodeOutputOffset, this.node.inputExtent);

    let value = {
      inputExtent: this.node.inputExtent - nodeInputOffset,
      outputExtent: this.node.outputExtent - this.nodeOutputOffset,
    }
    if (this.node.removedElements !== undefined) {
      value.removed = this.node.removedElements.slice(nodeInputOffset);
    }

    // ascend until we find a node with a next child; stop if we reach the root
    // of the tree without finding one.
    let currentNode = this.node;
    let nextChildIndex;
    while (true) {
      if (!this.ascend()) {
        this.done = true;
        return {done: false, value};
      }

      nextChildIndex = this.node.children.indexOf(currentNode) + 1;
      if (nextChildIndex < this.node.children.length) {
        break;
      } else {
        currentNode = this.node;
      }
    }

    // descend to the next child, then down to its leftmost leaf
    let childInputStart = this.nodeInputStart;
    let childOutputStart = this.nodeOutputStart;

    while (!this.node.isLeaf()) {
      for (var i = 0; i < this.node.children.length; i++) {
        let child = this.node.children[i];
        if (i === nextChildIndex) {
          this.descend(child, childInputStart, childOutputStart);
          nextChildIndex = 0; // next iteration will descend to leftmost child
          break;
        } else {
          childInputStart += child.inputExtent;
          childOutputStart += child.outputExtent;
        }
      }
    }

    return {
      done: false,
      value: {inputExtent, outputExtent, removed}
    };
  }

  ascend() {
    if (this.path.length === 0) {
      return false;
    }

    let {node, nodeInputStart, nodeOutputStart} = this.path.pop();
    this.node = node;
    this.nodeInputStart = nodeInputStart;
    this.nodeOutputStart = nodeOutputStart;
    return true;
  }

  descend(child, childInputStart, childOutputStart) {
    this.path.push({
      node: this.node,
      nodeInputStart: this.nodeInputStart,
      nodeOutputStart: this.nodeOutputStart
    });
    this.node = child;
    this.nodeInputStart = childInputStart;
    this.nodeOutputStart = childOutputStart;
  }
}

function concatenateTrees(left, right) {

}

class Node {
  constructor(children) {
    this.children = children;
    this.height = this.children[0].getHeight() + 1;
  }

  isLeaf() {
    return false;
  }

  getHeight() {
    return this.height;
  }
}

class Leaf {
  constructor(inputExtent, outputExtent, removedElements) {
    this.inputExtent = inputExtent;
    this.outputExtent = outputExtent;
    this.removedElements = removedElements;
  }

  isLeaf() {
    return true;
  }

  isChange() {
    return this.removedElements !== undefined;
  }

  getHeight() {
    return 1;
  }
}
