import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { arrayChunk } from '@ez4/utils';
import { deepEqual } from 'node:assert';

describe('array chunk utils', () => {
  const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  it('assert :: array chunk', () => {
    const chunks = arrayChunk(array, 3);

    equal(chunks.length, 4);

    deepEqual(chunks[0], [0, 1, 2]);
    deepEqual(chunks[1], [3, 4, 5]);
    deepEqual(chunks[2], [6, 7, 8]);
    deepEqual(chunks[3], [9]);
  });
});
