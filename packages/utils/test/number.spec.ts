import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAnyNumber } from '@ez4/utils';

describe('number utils', () => {
  it('assert :: is any number', () => {
    ok(isAnyNumber(123));
  });

  it('assert :: is not a number', () => {
    ok(!isAnyNumber(NaN));
    ok(!isAnyNumber(null));
    ok(!isAnyNumber(undefined));
    ok(!isAnyNumber(false));
    ok(!isAnyNumber(true));
    ok(!isAnyNumber('123'));
    ok(!isAnyNumber({}));
  });
});
