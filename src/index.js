'use babel';

export function activate() {
  atom.commands.add('atom-workspace', {
    'data-observer:run-tests': runTests
  });
  atom.keymaps.add('data-observer', {'atom-workspace': {
    'ctrl-alt-cmd-p': 'data-observer:run-tests'
  }});
}

function runTests() {
  var glob = require('glob'),
      Mocha = require('mocha');

  var mocha = new Mocha();

  glob(__dirname + "/**/*.js", function(error, files) {
    for (var file of files) {
      delete require.cache[file];
    }
  });

  glob(__dirname + "/../test/**/*-test.js", function(error, files) {
    for (var file of files) {
      delete require.cache[file];
      mocha.addFile(file);
    }
    mocha.run();
  });
}
