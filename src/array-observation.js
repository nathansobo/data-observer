'use babel';

import {Disposable, Emitter} from 'event-kit';
import ArrayPatch from './array-patch';
import ArrayMapObservation from './array-map-observation';

export default class ArrayObservation {
  constructor(array) {
    this.array = array;
    this.emitter = new Emitter();
    this.arrayDidChange = this.arrayDidChange.bind(this);
    this.subscriberCount = 0;
  }

  getValues() {
    return this.array.slice();
  }

  onDidChangeValues(fn) {
    if (++this.subscriberCount === 1) {
      Array.observe(this.array, this.arrayDidChange);
    }

    let disposable = this.emitter.on('did-change-values', fn);

    return new Disposable(() => {
      disposable.dispose();
      if (--this.subscriberCount === 0) {
        Array.unobserve(this.array, this.arrayDidChange);
      }
    });
  }

  map(fn) {
    return new ArrayMapObservation(this, fn);
  }

  arrayDidChange(changes) {
    let patch = new ArrayPatch();

    for (let {type, index, removed, addedCount} of changes) {
      if (type === 'splice') {
        patch.splice(index, removed.length, addedCount);
      }
    }

    // setImmediate allows uncaught exceptions to be reported in Node 0.12.0
    setImmediate(() => {
      let coalescedChanges = patch.getChanges().map(({index, removedCount, addedCount}) => (
        {index, removedCount, added: this.array.slice(index, index + addedCount)}
      ));
      this.emitter.emit('did-change-values', coalescedChanges);
    });
  }
}
