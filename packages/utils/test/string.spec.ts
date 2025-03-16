import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toKebabCase, toCamelCase } from '@ez4/utils';

describe('string utils', () => {
  it('assert :: kebab case', () => {
    const tests = [
      // Already in kebab-case
      toKebabCase('testing-kebab-case1'),

      // From CamelCase
      toKebabCase('TestingKebabCase2'),
      toKebabCase('TestingKEBABCase3'),

      // From snake_case
      toKebabCase('testing_kebab_case4'),

      // Convert whitespace
      toKebabCase('Testing KEBAB Case5'),

      // Remove invalid characters
      toKebabCase('-_Testing: _-_ KEBAB -_- @Case6_-')
    ];

    deepEqual(tests, [
      'testing-kebab-case1',
      'testing-kebab-case2',
      'testing-kebab-case3',
      'testing-kebab-case4',
      'testing-kebab-case5',
      'testing-kebab-case6'
    ]);
  });

  it('assert :: camel case', () => {
    const tests = [
      // Already in kebab-case
      toCamelCase('testing-camel-case1'),

      // From CamelCase
      toCamelCase('TestingCamelCase2'),
      toCamelCase('TestingCAMELCase3'),

      // From snake_case
      toCamelCase('testing_camel_case4'),

      // Convert whitespace
      toCamelCase('Testing CAMEL Case5'),

      // Remove invalid characters
      toCamelCase('-_Testing: _-_ CAMEL -_- @Case6_-')
    ];

    deepEqual(tests, [
      'testing_camel_case1',
      'testing_camel_case2',
      'testing_camel_case3',
      'testing_camel_case4',
      'testing_camel_case5',
      'testing_camel_case6'
    ]);
  });
});
