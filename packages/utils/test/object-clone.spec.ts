import { equal, deepEqual, notEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deepClone } from '@ez4/utils';

describe('object clone utils', () => {
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

  it('assert :: deep clone', () => {
    const result = deepClone(object);

    notEqual(result, object);
    deepEqual(result, object);

    notEqual(result.first.array, object.first.array);
  });

  it('assert :: deep clone (with depth)', () => {
    const result = deepClone(object, { depth: 0 });

    notEqual(result, object);
    deepEqual(result, object);

    equal(result.first, object.first);
  });

  it('assert :: deep clone (with exclude)', () => {
    const result = deepClone(object, {
      exclude: {
        first: {
          second: true,
          level: false // do not exclude.
        }
      }
    });

    deepEqual(result, {
      level: 1,
      first: {
        level: 2,
        array: [1, 2, 3]
      }
    });
  });

  it('assert :: deep clone (with include)', () => {
    const result = deepClone(object, {
      include: {
        level: true,
        first: {
          second: true,
          level: false // do not include.
        }
      }
    });

    deepEqual(result, {
      level: 1,
      first: {
        second: {
          level: 3,
          third: true
        }
      }
    });
  });
});
