import { equal, deepEqual, notDeepStrictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { arrayShuffle } from '@ez4/utils';

describe('array shuffle utils', () => {
  const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  it('assert :: array shuffle', () => {
    const result = arrayShuffle(array);

    equal(array.length, result.length);

    notDeepStrictEqual(array, result);
    deepEqual(array, result.sort());
  });
});
