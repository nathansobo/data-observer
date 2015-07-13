'use babel';

import ArrayObservation from './array-observation';
import ObjectObservation from './object-observation';

export default function observe(object, ...rest) {
  if (Array.isArray(object)) {
    let [fn] = rest;
    let observation = new ArrayObservation(object);
    return fn ? observation.map(fn) : observation;
  } else {
    return new ObjectObservation(object, ...rest);
  }
}
