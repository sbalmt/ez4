import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deepEqual as deepEquals } from '@ez4/utils';

describe('array equality utils', () => {
  it('assert :: deep equals', () => {
    const target = [[123], 'abc', { field: true }];
    const source = [[123], 'abc', { field: true }];

    const result = deepEquals(target, source);

    ok(result);
  });
});
