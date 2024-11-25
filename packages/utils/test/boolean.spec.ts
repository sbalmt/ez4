import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAnyBoolean } from '@ez4/utils';

describe.only('boolean utils', () => {
  it('assert :: is any boolean', () => {
    ok(isAnyBoolean(true));
    ok(isAnyBoolean(false));
  });

  it('assert :: is not a boolean', () => {
    ok(!isAnyBoolean(NaN));
    ok(!isAnyBoolean(null));
    ok(!isAnyBoolean(undefined));
    ok(!isAnyBoolean('true'));
    ok(!isAnyBoolean({}));
  });
});
