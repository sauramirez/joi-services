'use strict';

module.exports = {
  extends: [
    'plugin:@hapi/recommended',
    '@bekindsoft/eslint-config-bekind'
  ],
  parserOptions: {
    ecmaVersion: 12  // set to 13 when the latest hapi lab gets released
  },
  rules: {
  }
};

