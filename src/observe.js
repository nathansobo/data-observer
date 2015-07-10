'use babel';

import ArrayObservation from './array-observation';

export default function observe(object, fn) {
  let observation = new ArrayObservation(object);
  return fn ? observation.map(fn) : observation;
}
