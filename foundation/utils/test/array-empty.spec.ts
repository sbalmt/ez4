import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isEmptyArray } from '@ez4/utils';

describe('array empty utils', () => {
  it('assert :: is empty array', () => {
    ok(isEmptyArray([]));
    ok(isEmptyArray([undefined]));
    ok(isEmptyArray(new Array()));
  });

  it('assert :: is not empty array', () => {
    ok(!isEmptyArray([null, undefined]));
    ok(!isEmptyArray([[], undefined, []]));
    ok(!isEmptyArray([1, 2, 3]));
  });
});
