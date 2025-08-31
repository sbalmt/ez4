import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isBase64 } from '@ez4/utils';

describe('base64 format', () => {
  it('assert :: valid base64', () => {
    ok(isBase64('ade1'));
    ok(isBase64('ad2='));
    ok(isBase64('ad=='));
  });

  it('assert :: invalid base64', () => {
    ok(!isBase64('@a=='));
    ok(!isBase64('a1d'));
    ok(!isBase64('a2='));
  });
});
