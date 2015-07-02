'use babel';

import Random from 'random-seed';

const NOT_DONE = {done: false};
const DONE = {done: true};

export default class SegmentTree {
  constructor(randomSeed = Date.now()) {
    this.randomSeed = randomSeed;
    this.randomGenerator = new Random(randomSeed);
    this.root = null;
  }

  buildIterator() {
    return new SegmentTreeIterator(this);
  }

  buildIteratorAtStart() {
    return new SegmentTreeIterator(this, true);
  }

  generateRandom() {
    return this.randomGenerator.random();
  }

  toHTML() {
    return this.root.toHTML();
  }
}

class SegmentTreeIterator {
  constructor(tree, rewind) {
    this.tree = tree;
    this.inputOffset = 0;
    this.outputOffset = 0;
    this.inputOffsetStack = [];
    this.outputOffsetStack = [];
    this.setNode(tree.root);

    if (rewind && this.node) {
      while (this.node.left) {
        this.descendLeft();
      }
    }
  }

  getInputStart() {
    return this.inputStart;
  }

  getInputEnd() {
    return this.inputEnd;
  }

  getOutputStart() {
    return this.outputStart;
  }

  getOutputEnd() {
    return this.outputEnd;
  }

  inChange() {
    return !!this.node && this.node.isEndOfChange;
  }

  insert(outputIndex, isEndOfChange) {
    if (!this.node) {
      this.createRoot(outputIndex, isEndOfChange);
      return;
    }

    if (this.node.parent) {
      throw new Error("Invalid iterator state for insertion");
    }

    let maxInputIndex = Infinity;

    while (true) {
      if (outputIndex === this.outputEnd) {
        break;
      } else if (outputIndex < this.outputEnd) {
        if (this.node.left) {
          maxInputIndex = this.inputEnd;
          this.descendLeft();
        } else {
          this.createLeftChild(outputIndex, isEndOfChange);
          break;
        }
      } else {
        if (this.node.right) {
          this.descendRight();
        } else {
          this.createRightChild(outputIndex, maxInputIndex, isEndOfChange);
          break;
        }
      }
    }
  }

  splitLeft() {
    let originalPriority = this.node.priority;
    this.node.priority = -1;
    this.bubbleNodeUp();

    // Our old tree gets everything to the right of the current node
    this.tree.root = this.node.right;
    this.node.right.parent = null;
    this.node.right.inputExtent = this.node.inputLeftExtent + this.node.right.inputExtent;
    this.node.right.inputLeftExtent = this.node.inputLeftExtent + this.node.right.inputLeftExtent;
    this.node.right.outputExtent = this.node.outputLeftExtent + this.node.right.outputExtent;
    this.node.right.outputLeftExtent = this.node.outputLeftExtent + this.node.right.outputLeftExtent;

    // We build a new tree for the current node and everything left of it
    this.tree = new SegmentTree(this.randomSeed);
    this.tree.root = this.node;
    this.node.right = null;

    this.node.priority = originalPriority;
    this.bubbleNodeDown();

    return this.tree;
  }

  updateOutputIndex(outputDelta) {
    this.node.outputLeftExtent += outputDelta;
    this.node.outputExtent += outputDelta;

    let node = this.node;
    while (node.parent) {
      if (node === node.parent.left) {
        node.parent.outputLeftExtent += outputDelta;
      }
      node.parent.outputExtent += outputDelta;
      node = node.parent;
    }
  }

  setNode(node) {
    this.node = node;

    if (node) {
      if (node.left) {
        this.inputStart = this.inputOffset + node.left.inputExtent;
        this.outputStart = this.outputOffset + node.left.outputExtent;
      } else {
        this.inputStart = this.inputOffset
        this.outputStart = this.outputOffset
      }

      this.inputEnd = this.inputOffset + node.inputLeftExtent;
      this.outputEnd = this.outputOffset + node.outputLeftExtent;
    } else {
      this.inputStart = 0;
      this.inputEnd = Infinity;
      this.outputStart = 0;
      this.outputEnd = Infinity;
    }
  }

  next() {
    if (!this.node) {
      return DONE;
    }

    if (this.node.right) {
      this.descendRight();
      while (this.node.left) {
        this.descendLeft();
      }
      return NOT_DONE;
    } else {
      while (this.node.parent && this.node.parent.right === this.node) {
        this.ascend();
      }
      if (this.node.parent) {
        this.ascend();
        return NOT_DONE;
      } else {
        return DONE;
      }
    }
  }

  ascend() {
    this.inputOffset = this.inputOffsetStack.pop();
    this.outputOffset = this.outputOffsetStack.pop();
    this.setNode(this.node.parent);
  }

  descendLeft() {
    this.inputOffsetStack.push(this.inputOffset);
    this.outputOffsetStack.push(this.outputOffset);
    this.setNode(this.node.left);
  }

  descendRight() {
    this.inputOffsetStack.push(this.inputOffset);
    this.outputOffsetStack.push(this.outputOffset);
    this.inputOffset += this.node.inputLeftExtent;
    this.outputOffset += this.node.outputLeftExtent;
    this.setNode(this.node.right);
  }

  createRoot(outputIndex, isEndOfChange) {
    this.tree.root = new Node(null, this.tree.generateRandom(), outputIndex, outputIndex, isEndOfChange);
    this.setNode(this.tree.root);
  }

  createLeftChild(outputIndex, isEndOfChange) {
    let outputLeftExtent = outputIndex - this.outputOffset;
    let inputLeftExtent = Math.min(outputLeftExtent, this.node.inputLeftExtent);
    this.node.left = new Node(this.node, this.tree.generateRandom(), inputLeftExtent, outputLeftExtent, isEndOfChange);
    this.descendLeft();
    this.bubbleNodeUp();
  }

  createRightChild(outputIndex, maxInputIndex, isEndOfChange) {
    let outputLeftExtent = outputIndex - this.outputEnd;
    let inputLeftExtent = Math.min(outputLeftExtent, maxInputIndex - this.inputEnd);
    this.node.right = new Node(this.node, this.tree.generateRandom(), inputLeftExtent, outputLeftExtent, isEndOfChange);
    this.descendRight();

    let node = this.node;
    while (node.parent && node.parent.right === node) {
      node.parent.inputExtent += inputLeftExtent;
      node.parent.outputExtent += outputLeftExtent;
      node = node.parent;
    }

    this.bubbleNodeUp();
  }

  bubbleNodeUp() {
    while (this.node.parent && this.node.priority < this.node.parent.priority) {
      if (this.node === this.node.parent.left) {
        this.rotateRight(this.node);
      } else {
        this.rotateLeft(this.node);
      }
    }
  }

  bubbleNodeDown() {
    while (true) {
      let leftPriority = this.node.left ? this.node.left.priority : Infinity;
      let rightPriority = this.node.right ? this.node.right.priority : Infinity;

      if (leftPriority < rightPriority && this.node.priority > leftPriority) {
        this.rotateRight(this.node.left);
      } else if (this.node.priority > rightPriority)  {
        this.rotateLeft(this.node.right);
      } else {
        break;
      }
    }
  }

  rotateRight(pivot) {
    let root = pivot.parent;

    if (root.parent) {
      if (root === root.parent.left) {
        root.parent.left = pivot;
      } else {
        root.parent.right = pivot;
      }
    } else {
      this.tree.root = pivot;
    }
    pivot.parent = root.parent;

    root.left = pivot.right;
    if (pivot.right) {
      pivot.right.parent = root;
    }

    pivot.right = root;
    root.parent = pivot;

    root.inputLeftExtent = root.inputLeftExtent - pivot.inputLeftExtent;
    root.inputExtent = root.inputExtent - pivot.inputLeftExtent;
    pivot.inputExtent = pivot.inputLeftExtent + root.inputExtent;

    root.outputLeftExtent = root.outputLeftExtent - pivot.outputLeftExtent;
    root.outputExtent = root.outputExtent - pivot.outputLeftExtent;
    pivot.outputExtent = pivot.outputLeftExtent + root.outputExtent;
  }

  rotateLeft() {
    let root = this.node.parent;
    let pivot = this.node;

    if (root.parent) {
      if (root === root.parent.left) {
        root.parent.left = pivot;
      } else {
        root.parent.right = pivot;
      }
    } else {
      this.tree.root = pivot;
    }
    pivot.parent = root.parent;

    root.right = pivot.left;
    if (pivot.left) {
      pivot.left.parent = root;
    }

    pivot.left = root;
    root.parent = pivot;

    pivot.inputLeftExtent = root.inputLeftExtent + pivot.inputLeftExtent;
    pivot.inputExtent = pivot.inputLeftExtent + (pivot.right ? pivot.right.inputExtent : 0);
    root.inputExtent = root.inputLeftExtent + (root.right ? root.right.inputExtent : 0);

    pivot.outputLeftExtent = root.outputLeftExtent + pivot.outputLeftExtent;
    pivot.outputExtent = pivot.outputLeftExtent + (pivot.right ? pivot.right.outputExtent : 0);
    root.outputExtent = root.outputLeftExtent + (root.right ? root.right.outputExtent : 0);
  }
}

let idCounter = 0;

class Node {
  constructor(parent, priority, inputLeftExtent, outputLeftExtent, isEndOfChange) {
    this.id = ++idCounter;

    this.parent = parent;
    this.priority = priority;
    this.inputLeftExtent = inputLeftExtent;
    this.outputLeftExtent = outputLeftExtent;
    this.inputExtent = inputLeftExtent;
    this.outputExtent = outputLeftExtent;
    this.isEndOfChange = isEndOfChange;
  }

  toHTML() {
    let s = '<style>';
    s += 'table { width: 100%; }'
    s += 'td { width: 50%; text-align: center; border: 1px solid gray; white-space: nowrap; }'
    s += '</style>';

    s += '<table>'

    s += '<tr>';
    s += '<td colspan="2">' + this.id + ': ' + this.outputLeftExtent + ', ' + this.outputExtent + '</td>';
    s += '</tr>';

    s += '<tr>';
    s += '<td>';
    if (this.left) {
      s += this.left.toHTML();
    } else {
      s += '&nbsp;'
    }
    s += '</td>';
    s += '<td>';
    if (this.right) {
      s += this.right.toHTML();
    } else {
      s += '&nbsp;'
    }
    s += '</td>';
    s += '</tr>';

    s += '</table>';

    return s;
  }
}
