/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'js'],

  // ---------------------------------------------------------------
  // COVERAGE CONFIGURATION
  //
  // collectCoverageFrom: tells Jest WHICH source files to measure.
  // Without this, only files imported by tests appear in the report.
  // Files no test touches would be invisible instead of showing 0%.
  //
  // We exclude module files (just DI wiring, no logic) and DTOs
  // (just decorator metadata, tested via integration tests).
  // ---------------------------------------------------------------
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
  ],

  // ---------------------------------------------------------------
  // COVERAGE THRESHOLDS
  //
  // If any metric drops below 80%, jest --coverage fails.
  // In CI/CD, this blocks the PR from merging.
  // ---------------------------------------------------------------
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};