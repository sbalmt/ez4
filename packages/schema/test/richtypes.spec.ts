import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/schema/library';

import { testFile } from './common.js';

describe('schema rich types', () => {
  registerTriggers();

  it('assert :: decimal', () => testFile('decimal'));
  it('assert :: integer', () => testFile('integer'));
  it('assert :: string', () => testFile('string'));
  it('assert :: date time', () => testFile('date-time'));
  it('assert :: identity', () => testFile('identity'));
  it('assert :: regex', () => testFile('regex'));
});
