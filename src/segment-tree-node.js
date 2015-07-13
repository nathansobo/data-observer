let idCounter = 0;

export default class SegmentTreeNode {
  constructor(parent, inputLeftExtent, outputLeftExtent) {
    this.parent = parent;
    this.inputLeftExtent = inputLeftExtent;
    this.outputLeftExtent = outputLeftExtent;
    this.inputExtent = inputLeftExtent;
    this.outputExtent = outputLeftExtent;

    this.id = ++idCounter;
    this.priority = Infinity;
    this.isChangeStart = false;
    this.isChangeEnd = false;
  }

  toHTML() {
    let s = '<style>';
    s += 'table { width: 100%; }';
    s += 'td { width: 50%; text-align: center; border: 1px solid gray; white-space: nowrap; }';
    s += '</style>';

    s += '<table>';

    s += '<tr>';

    let changeStart = this.isChangeStart ? '&lt;&lt; ' : '';
    let changeEnd = this.isChangeEnd ? ' &gt;&gt;' : '';

    s += '<td colspan="2">' + changeStart + this.inputLeftExtent + ', ' + this.outputLeftExtent + changeEnd + '</td>';
    s += '</tr>';

    s += '<tr>';
    s += '<td>';
    if (this.left) {
      s += this.left.toHTML();
    } else {
      s += '&nbsp;';
    }
    s += '</td>';
    s += '<td>';
    if (this.right) {
      s += this.right.toHTML();
    } else {
      s += '&nbsp;';
    }
    s += '</td>';
    s += '</tr>';

    s += '</table>';

    return s;
  }
}
