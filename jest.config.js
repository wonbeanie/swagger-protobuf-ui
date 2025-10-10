const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/scripts/temp_test_protject",
    "/__tests__/mocks",
    "/__tests__/test-data",
    "/e2e",
    "/dist",
    "/jest.setup.ts"
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/__tests__/mocks/css-mock.ts",
  },
  coveragePathIgnorePatterns: [
    "/__tests__/mocks",
    "/__tests__/test-data",
    "/types"
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts'],
};