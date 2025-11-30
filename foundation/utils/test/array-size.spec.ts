import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { arraySize } from '@ez4/utils';

describe('array size utils', () => {
  it('assert :: array size', () => {
    const size = arraySize([
      1,
      2,
      {
        foo: 'foo',
        bar: 'bar',
        baz: undefined
      },
      undefined,
      4
    ]);

    equal(size, 6);
  });
});
