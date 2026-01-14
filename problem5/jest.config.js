module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/integration/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: 'tsconfig.test.json', // Use test-specific config with Jest types
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/config/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 85,
      lines: 75,
      statements: 75,
    },
  },
  verbose: false,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  transformIgnorePatterns: ['node_modules/(?!@paralleldrive)'],
  moduleNameMapper: {
    '@paralleldrive/cuid2': '<rootDir>/tests/__mocks__/cuid2.js',
  },
};
