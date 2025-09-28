import { ok, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { uniqueArray } from '@ez4/utils';

describe('array unique utils', () => {
  it('assert :: unique array', () => {
    const target = ['foo', 'bar', 'bar', 'baz', 'foo'];
    const result = uniqueArray(target);

    deepEqual(result, ['foo', 'bar', 'baz']);

    ok(result);
  });
});
