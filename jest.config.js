/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          rootDir: ".",
          module: "commonjs",
          target: "es2020",
          lib: ["es2020"],
          types: ["node", "jest"],
          strict: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: "node",
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/generated/**",
    "!src/server.ts",
    "!src/utils/seed.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov"],
  verbose: true,
};
