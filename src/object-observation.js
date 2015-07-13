'use babel';

import {Disposable, Emitter} from 'event-kit';
import ScalarMapObservation from './scalar-map-observation';

export default class ObjectObservation {
  constructor(object, ...rest) {
    this.object = object;

    if (rest.length > 0) {
      this.transform = ((typeof last(rest) === 'function') ? rest.pop() : null);
      if (rest.length > 1 && !this.transform) {
        throw new Error('Observing multiple properties requires a function to combine them into a single value.');
      }
      this.observedProperties = rest;
      this.observedPropertiesSet = new Set(this.observedProperties);
    }

    this.emitter = new Emitter();
    this.objectDidChange = this.objectDidChange.bind(this);
    this.subscriberCount = 0;
  }

  getValue() {
    if (this.observedProperties.length > 0) {
      if (!this.transform && this.observedProperties.length === 1) {
        return this.object[this.observedProperties[0]];
      } else {
        let propertyValues = this.observedProperties.map(propertyName => this.object[propertyName]);
        return this.transform.apply(null, propertyValues);
      }
    } else {
      if (this.transform) {
        return this.transform.call(null, this.object);
      } else {
        return this.object;
      }
    }
  }

  onDidChangeValue(fn) {
    if (++this.subscriberCount === 1) {
      Object.observe(this.object, this.objectDidChange);
    }

    let disposable = this.emitter.on('did-change-value', fn);

    return new Disposable(() => {
      disposable.dispose();
      if (--this.subscriberCount === 0) {
        Object.unobserve(this.object, this.objectDidChange);
      }
    });
  }

  map(transform) {
    return new ScalarMapObservation(this, transform);
  }

  objectDidChange(changes) {
    setImmediate(() => {
      if (this.observedPropertiesSet) {
        for (let change of changes) {
          if (this.observedPropertiesSet.has(change.name)) {
            this.emitter.emit('did-change-value', this.getValue());
            break;
          }
        }
      } else {
        this.emitter.emit('did-change-value', this.object);
      }
    });
  }
}

function last(array) {
  return array[array.length - 1];
}
