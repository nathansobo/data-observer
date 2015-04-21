import ArrayObservation from './array-observation';

export default function observe(object) {
  return new ArrayObservation(object);
}
