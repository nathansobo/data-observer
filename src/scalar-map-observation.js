'use babel';

import {Disposable, Emitter} from 'event-kit';

export default class ScalarMapObservation {
  constructor(operand, transform) {
    this.operand = operand;
    this.transform = transform;
    this.emitter = new Emitter();
    this.operandDidChangeValue = this.operandDidChangeValue.bind(this);
    this.subscriberCount = 0;
    this.operandDisposable = null;
  }

  getValue() {
    return this.transform(this.operand.getValue());
  }

  onDidChangeValue(fn) {
    if (++this.subscriberCount === 1) {
      this.operandDisposable = this.operand.onDidChangeValue(this.operandDidChangeValue);
    }

    let disposable = this.emitter.on('did-change-value', fn);

    return new Disposable(() => {
      disposable.dispose();
      if (--this.subscriberCount === 0) {
        this.operandDisposable.dispose();
      }
    });
  }

  map(transform) {
    return new ScalarMapObservation(this, transform);
  }

  operandDidChangeValue(value) {
    this.emitter.emit('did-change-value', this.transform(value));
  }
}
