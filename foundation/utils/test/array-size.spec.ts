import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { arraySize } from '@ez4/utils';

describe('array size utils', () => {
  const array = [
    1,
    2,
    {
      foo: 'foo',
      bar: 'bar'
    },
    4
  ];

  it('assert :: array size', () => {
    const size = arraySize(array);

    equal(size, 6);
  });
});
