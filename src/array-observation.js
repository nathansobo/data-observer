'use babel';

import {Disposable, Emitter} from 'event-kit';
import ArrayPatch from './array-patch';

export default class ArrayObservation {
  constructor(array) {
    this.array = array;
    this.emitter = new Emitter();
    this.arrayDidChange = this.arrayDidChange.bind(this);
  }

  onDidChange(fn) {
    if (!this.disposable) {
      Array.observe(this.array, this.arrayDidChange);

      this.disposable = new Disposable(function() {
        Array.unobserve(this.array, this.arrayDidChange);
      });
    }
    this.subscriberCount++;

    let disposable = this.emitter.on('did-change', fn);

    return new Disposable(() => {
      disposable.dispose();
      this.subscriberCount--;
      if (this.subscriberCount === 0) {
        this.disposable.dispose();
      }
    });
  }

  arrayDidChange(changes) {
    let patch = new ArrayPatch();

    for (let {type, index, removed, addedCount} of changes) {
      if (type === 'splice') {
        patch.splice(index, removed.length, addedCount);
      }
    }

    setImmediate(() => {
      this.emitter.emit('did-change', patch.getChanges());
    });
  }
}
