const path = require('path');

function onCreateBabelConfig({ actions }, options) {
  const libsDir = path.resolve(options.path, '../..', 'libs');

  actions.setBabelPlugin({
    name: require.resolve(`babel-plugin-module-resolver`),
    options: {
      'root': ['./src'],
      'alias': {
        'libs': libsDir
      }
    }
  });
}

exports.onCreateBabelConfig = onCreateBabelConfig;