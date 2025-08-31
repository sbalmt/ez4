import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/schema/library';

import { testFile } from './common.js';

describe('schema types', () => {
  registerTriggers();

  it('assert :: scalar types', () => testFile('scalar'));
  it('assert :: boolean types', () => testFile('boolean'));
  it('assert :: object types', () => testFile('object'));
  it('assert :: reference types', () => testFile('reference'));
  it('assert :: union types', () => testFile('union'));
  it('assert :: array types', () => testFile('array'));
  it('assert :: tuple types', () => testFile('tuple'));
  it('assert :: enum types', () => testFile('enum'));
  it('assert :: required types', () => testFile('required'));
  it('assert :: partial types', () => testFile('partial'));
  it('assert :: nullish types', () => testFile('nullish', { nullish: true }));
});
