import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/schema/library';
import { NamingStyle } from '@ez4/schema';

import { testFile } from './common';

describe('schema naming', () => {
  registerTriggers();

  it('assert :: camel case', () =>
    testFile('naming', {
      namingStyle: NamingStyle.CamelCase,
      fileName: 'camelcase'
    }));

  it('assert :: pascal case', () =>
    testFile('naming', {
      namingStyle: NamingStyle.PascalCase,
      fileName: 'pascalcase'
    }));

  it('assert :: snake case', () =>
    testFile('naming', {
      namingStyle: NamingStyle.SnakeCase,
      fileName: 'snakecase'
    }));

  it('assert :: kebab case', () =>
    testFile('naming', {
      namingStyle: NamingStyle.KebabCase,
      fileName: 'kebabcase'
    }));
});
