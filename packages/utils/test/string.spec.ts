import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toKebabCase, toCamelCase, toSnakeCase, toPascalCase, capitalizeString, joinString } from '@ez4/utils';

describe('string utils', () => {
  it('assert :: join', () => {
    equal(joinString(' ', ['test', null, '1']), 'test 1');
    equal(joinString(' ', ['test', undefined, '2']), 'test 2');
    equal(joinString(' ', ['test', null, undefined, '3']), 'test 3');
    equal(joinString(' ', [null, 'test', undefined, '4', undefined]), 'test 4');
  });

  it('assert :: capitalize', () => {
    equal(capitalizeString('test'), 'Test');
  });

  it('assert :: kebab case', () => {
    const tests = [
      // Already in kebab-case
      toKebabCase('testing-kebab-case1'),

      // From camelCase
      toKebabCase('testingKebabCase2'),
      toKebabCase('testingKEBABCase3'),

      // From snake_case
      toKebabCase('testing_kebab_case4'),

      // From PascalCase
      toKebabCase('TestingKebabCase5'),
      toKebabCase('TestingKEBABCase6'),

      // Convert whitespace
      toKebabCase('Testing KEBAB Case7'),

      // Remove invalid characters
      toKebabCase('-_Testing: _-_ KEBAB -_- @Case8_-')
    ];

    deepEqual(tests, [
      'testing-kebab-case1',
      'testing-kebab-case2',
      'testing-kebab-case3',
      'testing-kebab-case4',
      'testing-kebab-case5',
      'testing-kebab-case6',
      'testing-kebab-case7',
      'testing-kebab-case8'
    ]);
  });

  it('assert :: snake case', () => {
    const tests = [
      // Already in snake_case
      toSnakeCase('testing_snake_case1'),

      // From camelCase
      toSnakeCase('testingSnakeCase2'),
      toSnakeCase('testingSNAKECase3'),

      // From kebab-case
      toSnakeCase('testing-snake-case4'),

      // From PascalCase
      toSnakeCase('TestingSnakeCase5'),
      toSnakeCase('TestingSNAKECase6'),

      // Convert whitespace
      toSnakeCase('Testing SNAKE Case7'),

      // Remove invalid characters
      toSnakeCase('-_Testing: _-_ SNAKE -_- @Case8_-')
    ];

    deepEqual(tests, [
      'testing_snake_case1',
      'testing_snake_case2',
      'testing_snake_case3',
      'testing_snake_case4',
      'testing_snake_case5',
      'testing_snake_case6',
      'testing_snake_case7',
      'testing_snake_case8'
    ]);
  });

  it('assert :: camel case', () => {
    const tests = [
      // Already in camelCase
      toCamelCase('testingCamelCase1'),
      toCamelCase('testingCAMELCase2'),

      // From kebab-case
      toCamelCase('testing-camel-case3'),

      // From snake_case
      toCamelCase('testing_camel_case4'),

      // From PascalCase
      toCamelCase('TestingCamelCase5'),
      toCamelCase('TestingCAMELCase6'),

      // Convert whitespace
      toCamelCase('Testing CAMEL Case7'),

      // Remove invalid characters
      toCamelCase('-_Testing: _-_ CAMEL -_- @Case8_-')
    ];

    deepEqual(tests, [
      'testingCamelCase1',
      'testingCamelCase2',
      'testingCamelCase3',
      'testingCamelCase4',
      'testingCamelCase5',
      'testingCamelCase6',
      'testingCamelCase7',
      'testingCamelCase8'
    ]);
  });

  it('assert :: pascal case', () => {
    const tests = [
      // Already in PascalCase
      toPascalCase('TestingPascalCase1'),
      toPascalCase('TestingPASCALCase2'),

      // From kebab-case
      toPascalCase('testing-pascal-case3'),

      // From snake_case
      toPascalCase('testing_pascal_case4'),

      // From camelCase
      toPascalCase('testingPascalCase5'),
      toPascalCase('testingPASCALCase6'),

      // Convert whitespace
      toPascalCase('Testing PASCAL Case7'),

      // Remove invalid characters
      toPascalCase('-_Testing: _-_ PASCAL -_- @Case8_-')
    ];

    deepEqual(tests, [
      'TestingPascalCase1',
      'TestingPascalCase2',
      'TestingPascalCase3',
      'TestingPascalCase4',
      'TestingPascalCase5',
      'TestingPascalCase6',
      'TestingPascalCase7',
      'TestingPascalCase8'
    ]);
  });
});
