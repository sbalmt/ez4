import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { deepClone, deepEqual as deepEquals } from '@ez4/utils';

describe.only('object equality utils', () => {
  const target = {
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

  it('assert :: deep equals', () => {
    const result = deepEquals(target, deepClone(target));

    ok(result);
  });

  it('assert :: deep equals (with depth)', () => {
    const source = {
      level: 1,
      first: target.first
    };

    const result = deepEquals(target, source, { depth: 0 });

    ok(result);
  });

  it('assert :: deep equals (with exclude)', () => {
    const source = {
      level: 1,
      first: {
        level: 2,
        array: [1, 2, 3],
        second: 'changed!'
      }
    };

    const result = deepEquals(target, source, {
      exclude: {
        first: {
          second: true
        }
      }
    });

    ok(result);
  });

  it('assert :: deep equals (with include)', () => {
    const source = {
      level: 1,
      first: {
        level: 2,
        array: [1, 2, 3],
        second: 'changed!'
      }
    };

    const result = deepEquals(target, source, {
      include: {
        first: {
          second: true
        }
      }
    });

    ok(!result);
  });
});
