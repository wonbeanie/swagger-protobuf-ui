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
  ],
  testMatch: ["**/__tests__/**/*.test.ts"],
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