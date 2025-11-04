import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { objectSize } from '@ez4/utils';

describe('object size utils', () => {
  const object = {
    level: 1,
    first: {
      level: 2,
      array: [1, 2, 3],
      second: {
        level: 3,
        third: true
      }
    }
  };

  it('assert :: object size', () => {
    const size = objectSize(object);

    equal(size, 10);
  });
});
