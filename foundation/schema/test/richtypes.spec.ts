import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/schema/library';

import { testFile } from './common';

describe('schema rich types', () => {
  registerTriggers();

  it('assert :: decimal', () => testFile('decimal'));
  it('assert :: integer', () => testFile('integer'));
  it('assert :: string', () => testFile('string'));
  it('assert :: date time', () => testFile('date-time'));
  it('assert :: identity', () => testFile('identity'));
  it('assert :: base64', () => testFile('base64'));
  it('assert :: regex', () => testFile('regex'));
});
