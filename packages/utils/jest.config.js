module.exports = {
  collectCoverage: true,
  // Ensures that we collect coverage from all source files, not just tested
  // ones.
  collectCoverageFrom: ['./src/**/*.ts'],
  coveragePathIgnorePatterns: [
    './src/index.ts',
    './src/test-utils',
    './src/json-schemas',
    // Jest currently doesn't collect coverage for child processes.
    // https://github.com/facebook/jest/issues/5274
    './src/eval-worker.ts',
  ],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 85.57,
      functions: 96.47,
      lines: 96.2,
      statements: 96.28,
    },
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  preset: 'ts-jest',
  // "resetMocks" resets all mocks, including mocked modules, to jest.fn(),
  // between each test case.
  resetMocks: true,
  // "restoreMocks" restores all mocks created using jest.spyOn to their
  // original implementations, between each test. It does not affect mocked
  // modules.
  restoreMocks: true,
  testEnvironment: 'node',
  testRegex: ['\\.test\\.(ts|js)$'],
  testTimeout: 2500,
};
