const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/scripts/temp_test_protject",
    "/__tests__/mocks",
    "/__tests__/test-data",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/__tests__/mocks/css-mock.ts",
  },
};