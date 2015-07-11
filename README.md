# data-observer
[![Travis build status](http://img.shields.io/travis/nathansobo/data-observer.svg?style=flat)](https://travis-ci.org/nathansobo/data-observer)

This library wraps `Object.observe` and `Array.observe` to make them more usable. **Warning: This library has not yet been tested in production.**

## Overview

### Observing Objects

To observe an object, pass it to the `observe` function to return a *scalar observation*.

```js
import observe from 'data-observer';

let object = {a: 1, b: 2, c: 3};

// observe a property
let observation = observe(object, 'a')
observation.getValue(); // => 1
observation.onDidChangeValue((a) => { // called when `object.a` changes
  console.log('a changed:', a)
});

// observe multiple properties
// pass a function to combine them into a single value
let observation = observe(object, 'a', 'b', 'c', (a, b, c) => a + b + c)
observation.getValue(); // => 6
observation.onDidChangeValue((value) => { // called when `object.a`, `.b`, or `.c` change
  console.log('a, b, or c changed:', value)
});

// observe the whole object
let observation = observe(object);
observation.getValue() // object
let disposable = observation.onDidChangeValue((object) => { // called when object changes
  console.log('object changed', object);
})
```

### Observing Arrays

This library is much better than the raw `Array.observe` API, because it efficiently coalesces the overlapping change events delivered by the raw API into a minimal list of non-overlapping changes. If you apply these changes to a copy of the original array in order, it will equal the current value of the observed array.

```js
let array = ['a', 'b', 'c', 'd', 'e'];
let original = array.slice();

observe(array).onDidChangeValues(changes => { // called when array changes
  for (let {index, removedCount, added} of changes) {
    original.splice(index, removedCount, ...added);
  }
});
```

### Mapping Over Observations

The *observations* are returned from the `observe` function support a `map` operation, which maps a transformation function over the current value(s) of the observation. Here we map `value => value + 1` over an array observation.

```js
let array = [1, 2, 3];
let observation = observe(array);
let mappedObservation = observation.map(value => value + 1);
mappedObservation.getValues(); // => [2, 3, 4]
```

The transform will also be applied to all `added` values passed to `onDidChangeValues` listeners.

Mapping over *scalar observations* is similar:

```
let object = {a: 'hello'};
let observation = observe(object, 'a');
let mappedObservation = observation.map(value => value.toUpperCase());
mappedObservation.getValue(); // => 'HELLO';
```

You can chain calls to `map` if you're so inclined:

```js
let doubleMapObservation =
  observation.map(value => value + 1).map(value => value * 6);
```

You can also apply a `map` operation by passing a transform function as the last argument to `observe`:

```js
let observation = observe(array, value => value + 1);
```


## API

### `observe(object, [...propertyNames], [transformFunction])`

Observe an entire object or specific properties on an object.

* `object` The object to observe.
* `...propertyNames` The names of one or more properties to observe. If more than one property name is provided, you must supply a `transformFunction` to combine them.
* `transformationFunction` An optional function taking one or more observed values as arguments that returns a single combined value for the observation. This argument is *required* if more than one property name is supplied.

Returns a *scalar observation*.

### `observe(array, [transformFunction])`

Observe an array.

* `array` The array to observe.
* `transformFunction` An optional function transforming the values of the observed array.

Returns an *array observation*.

### Scalar Observations

These are returned when observing an object or an object's fields. Scalar observations represent a single value that changes over time.

#### `getValue()`

Get the current value of the observation.

#### `onDidChangeValue(fn)`

Subscribe to changes to the observation's value.

* `fn` A function that will be called with the current value of the observation whenever it changes.

Returns a `Disposable` on which `.dispose()` can be called to cancel the subscription.

#### `map(transformFn)`

Build a new observation based on applying the given transform function to the this observation's value.

* `transformFn` A function that transforms the observation's value.

Returns a new *scalar observation*.

### Array Observations

#### `getValues()`

Get the current values of the observed array.

#### `onDidChangeValues(fn)`

Subscribe to changes to the observed array. Applying the changes passed to the listener function to a copy of the array as it existed before being changed in order via `splice` should update the copy to match the current state of the array.

* `fn` A function that will be called with an array of changes whenever the observed array changes.
  * `changes` An `Array` of change objects with the following keys:
    * `index` Where the change starts.
    * `removedCount` The number of elements that were removed.
    * `added` The elements that were added.

Returns a `Disposable` on which `.dispose()` can be called to cancel the subscription.

#### `map(transformFn)`

Build a new observation based on applying the given transform function to the this observation's values.

* `transformFn` A function that transforms the observation's values.

Returns a new *array observation*.

## Rationale

I built this library so I can use it from a view framework that I haven't finished writing yet. It will combine virtual-DOM diffing with data-model observation. Stay tuned.

## Ideas

Array observations could be extended with relational methods, such as `filter`, `join`, `flatMap`, etc. This would enable us to use the ideas of *functional relational programming* described in [Out of the Tarpit (PDF)][tarpit] while still using simple JavaScript primitives. Scalar observations could similarly be extended with an API reminiscent of [Rx][rx].

[tarpit]: http://shaffner.us/cs/papers/tarpit.pdf
[rx]: https://github.com/Reactive-Extensions/RxJS
