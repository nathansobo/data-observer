'use babel';

import {Disposable, Emitter} from 'event-kit';

export default class ArrayMapObservation {
  constructor(operand, transform) {
    this.operand = operand;
    this.transform = transform;
    this.emitter = new Emitter();
    this.operandDidChangeValues = this.operandDidChangeValues.bind(this);
    this.subscriberCount = 0;
    this.operandDisposable = null;
  }

  getValues() {
    return this.operand.getValues().map(this.transform);
  }

  onDidChangeValues(fn) {
    if (++this.subscriberCount === 1) {
      this.operandDisposable = this.operand.onDidChangeValues(this.operandDidChangeValues);
    }

    let disposable = this.emitter.on('did-change-values', fn);

    return new Disposable(() => {
      disposable.dispose();
      if (--this.subscriberCount === 0) {
        this.operandDisposable.dispose();
      }
    });
  }

  map(transform) {
    return new ArrayMapObservation(this, transform);
  }

  operandDidChangeValues(changes) {
    this.emitter.emit('did-change-values', changes.map(({index, removedCount, added}) =>
      ({index, removedCount, added: added.map(this.transform)})
    ));
  }
}
