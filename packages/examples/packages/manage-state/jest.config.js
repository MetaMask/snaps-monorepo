const deepmerge = require('deepmerge');

const baseConfig = require('../../../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    browser: {
      headless: true,
    },
  },

  // End-to-end tests can take a while to run, so we need to increase the
  // default timeout.
  testTimeout: 10000,

  // Since `@metamask/snaps-jest` runs in the browser, we can't collect
  // coverage information.
  collectCoverage: false,

  // This is required for the tests to run inside the `MetaMask/snaps`
  // repository. You don't need this in your own project.
  moduleNameMapper: {
    '^@metamask/(.+)$': [
      '<rootDir>/../../../$1/src',
      '<rootDir>/../../../../node_modules/@metamask/$1',
      '<rootDir>/node_modules/@metamask/$1',
    ],
  },
});
