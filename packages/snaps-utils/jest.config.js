const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: [
    './src/index.ts',
    './src/index.browser.ts',
    './src/vfile/index.ts',
    './src/vfile/index.browser.ts',
    './src/manifest/index.ts',
    './src/manifest/index.browser.ts',
    './src/test-utils',
    './src/json-schemas',
    // Jest currently doesn't collect coverage for child processes.
    // https://github.com/facebook/jest/issues/5274
    './src/eval-worker.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 94.76,
      functions: 98.95,
      lines: 98.74,
      statements: 98.74,
    },
  },
  testTimeout: 2500,
});
