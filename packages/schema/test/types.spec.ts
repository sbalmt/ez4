import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/schema/library';

import { testFile } from './common.js';

describe.only('type schemas', () => {
  registerTriggers();

  it('assert :: scalar types', () => testFile('scalar'));
  it('assert :: object types', () => testFile('object'));
  it('assert :: reference types', () => testFile('reference'));
  it('assert :: union types', () => testFile('union'));
  it('assert :: array types', () => testFile('array'));
  it('assert :: tuple types', () => testFile('tuple'));
  it('assert :: enum types', () => testFile('enum'));
});
