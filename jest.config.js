// jest.config.js
// reference: https://kulshekhar.github.io/ts-jest/user/config/

const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
   globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  preset: 'ts-jest/presets/js-with-ts',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' + compilerOptions.rootDir}),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

