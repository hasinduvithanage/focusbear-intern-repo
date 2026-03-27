/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
