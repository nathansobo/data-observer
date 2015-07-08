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

  splice(outputStart, removedCount, addedCount) {
    let outputEnd = outputStart + removedCount;
    let spliceDelta = addedCount - removedCount;

    let endNode = this.insertNode(outputEnd);
    endNode.isEndOfChange = true;
    endNode.priority = -2;
    this.bubbleNodeUp(endNode);

    let startNode = this.insertNode(outputStart);
    startNode.priority = -1;
    this.bubbleNodeUp(startNode);

    startNode.right = null;
    endNode.outputLeftExtent += spliceDelta;
    endNode.outputExtent += spliceDelta;

    startNode.priority = this.generateRandom();
    this.bubbleNodeDown(startNode);
    endNode.priority = this.generateRandom();
    this.bubbleNodeDown(endNode);
  }

  insertNode(outputIndex) {
    let node = this.root;

    if (!node) {
      return this.root = new Node(null, outputIndex, outputIndex);
    }

    let inputOffset = 0;
    let outputOffset = 0;

    let maxInputIndex = Infinity;

    while (true) {
      let inputStart = inputOffset + (node.left ? node.left.inputExtent : 0)
      let outputStart = outputOffset + (node.left ? node.left.outputExtent : 0)
      let inputEnd = inputOffset + node.inputLeftExtent;
      let outputEnd = outputOffset + node.outputLeftExtent;

      if (outputIndex === outputEnd) {
        return node;
      } else if (outputIndex < outputEnd) {
        if (node.left) {
          maxInputIndex = inputEnd;
          node = node.left;
        } else {
          let outputLeftExtent = outputIndex - outputOffset;
          let inputLeftExtent = Math.min(outputLeftExtent, node.inputLeftExtent);
          return node.left = new Node(node, inputLeftExtent, outputLeftExtent);
        }
      } else {
        if (node.right) {
          inputOffset += node.inputLeftExtent;
          outputOffset += node.outputLeftExtent;
          node = node.right;
        } else {
          let outputLeftExtent = outputIndex - outputEnd;
          let inputLeftExtent = Math.min(outputLeftExtent, maxInputIndex - inputEnd);
          return node.right = new Node(node, inputLeftExtent, outputLeftExtent);
        }
      }
    }
  }

  bubbleNodeUp(node) {
    while (node.parent && node.priority < node.parent.priority) {
      if (node === node.parent.left) {
        this.rotateNodeRight(node);
      } else {
        this.rotateNodeLeft(node);
      }
    }
  }

  bubbleNodeDown(node) {
    while (true) {
      let leftChildPriority = node.left ? node.left.priority : Infinity;
      let rightChildPriority = node.right ? node.right.priority : Infinity;

      if (leftChildPriority < rightChildPriority && leftChildPriority < node.priority) {
        this.rotateNodeRight(node.left);
      } else if (rightChildPriority < node.priority)  {
        this.rotateNodeLeft(node.right);
      } else {
        break;
      }
    }
  }

  rotateNodeLeft(pivot) {
    let root = pivot.parent;

    if (root.parent) {
      if (root === root.parent.left) {
        root.parent.left = pivot;
      } else {
        root.parent.right = pivot;
      }
    } else {
      this.root = pivot;
    }
    pivot.parent = root.parent;

    root.right = pivot.left;
    if (root.right) {
      root.right.parent = root;
    }

    pivot.left = root;
    pivot.left.parent = pivot;

    pivot.inputLeftExtent = root.inputLeftExtent + pivot.inputLeftExtent;
    pivot.inputExtent = pivot.inputLeftExtent + (pivot.right ? pivot.right.inputExtent : 0);
    root.inputExtent = root.inputLeftExtent + (root.right ? root.right.inputExtent : 0);

    pivot.outputLeftExtent = root.outputLeftExtent + pivot.outputLeftExtent;
    pivot.outputExtent = pivot.outputLeftExtent + (pivot.right ? pivot.right.outputExtent : 0);
    root.outputExtent = root.outputLeftExtent + (root.right ? root.right.outputExtent : 0);
  }

  rotateNodeRight(pivot) {
    let root = pivot.parent;

    if (root.parent) {
      if (root === root.parent.left) {
        root.parent.left = pivot;
      } else {
        root.parent.right = pivot;
      }
    } else {
      this.root = pivot;
    }
    pivot.parent = root.parent;

    root.left = pivot.right;
    if (root.left) {
      root.left.parent = root;
    }

    pivot.right = root;
    pivot.right.parent = pivot;

    root.inputLeftExtent = root.inputLeftExtent - pivot.inputLeftExtent;
    root.inputExtent = root.inputExtent - pivot.inputLeftExtent;
    pivot.inputExtent = pivot.inputLeftExtent + root.inputExtent;

    root.outputLeftExtent = root.outputLeftExtent - pivot.outputLeftExtent;
    root.outputExtent = root.outputExtent - pivot.outputLeftExtent;
    pivot.outputExtent = pivot.outputLeftExtent + root.outputExtent;
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
}

let idCounter = 0;

class Node {
  constructor(parent, inputLeftExtent, outputLeftExtent) {
    this.parent = parent;
    this.inputLeftExtent = inputLeftExtent;
    this.outputLeftExtent = outputLeftExtent;
    this.inputExtent = inputLeftExtent;
    this.outputExtent = outputLeftExtent;

    this.id = ++idCounter;
    this.priority = Infinity;
    this.isEndOfChange = false;
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
