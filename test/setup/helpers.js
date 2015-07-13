export function awaitObservation(observation, fn) {
  let disposable;
  let listener = (changes) => {
    disposable.dispose();
    fn(changes);
  };

  if (typeof observation.onDidChangeValue === 'function') {
    disposable = observation.onDidChangeValue(listener);
  } else if (typeof observation.onDidChangeValues === 'function') {
    disposable = observation.onDidChangeValues(listener);
  } else {
    throw new Error('Not an observation');
  }
}

// Used to debug the tree structure
export function saveHTML(object, identifier='') {
  let fs = require('fs');
  let path = __dirname + '/../../test-output' + identifier + '.html';
  console.log('saving to', path);
  fs.writeFileSync(path, object.toHTML(), 'utf8');
}
