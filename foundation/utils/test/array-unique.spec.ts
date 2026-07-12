import { ok, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { arrayUnique } from '@ez4/utils';

describe('array unique utils', () => {
  it('assert :: unique array', () => {
    const target = ['foo', 'bar', 'bar', 'baz', 'foo'];
    const result = arrayUnique(target);

    deepEqual(result, ['foo', 'bar', 'baz']);

    ok(result);
  });

  it('assert :: unique arrays (multiple)', () => {
    const targetA = ['foo', 'bar', 'bar', 'baz', 'foo'];
    const targetB = ['bar', 'qux', 'foo', 'baz'];

    const result = arrayUnique(targetA, targetB);

    deepEqual(result, ['foo', 'bar', 'baz', 'qux']);

    ok(result);
  });

  it('assert :: unique arrays (multiple and undefined)', () => {
    const targetA = [undefined, 'foo', 'bar', 'bar', 'baz', 'foo'];
    const targetB = ['bar', 'qux', 'foo', 'baz', undefined];

    const result = arrayUnique(targetA, undefined, targetB);

    deepEqual(result, ['foo', 'bar', 'baz', 'qux']);

    ok(result);
  });
});
