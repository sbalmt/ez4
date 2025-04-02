import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';

import { deepMerge } from '@ez4/utils';

describe('object merging utils', () => {
  const target = {
    first: {
      array: [1, 2, 3],
      second: {
        level: 3
      }
    }
  };

  const source = {
    level: 1,
    first: {
      level: 2,
      array: [4, 5, 6],
      second: {
        third: true
      }
    }
  };

  it('assert :: deep merge', () => {
    const result = deepMerge(target, source);

    deepEqual(result, {
      level: 1,
      first: {
        level: 2,
        array: [4, 5, 6],
        second: {
          level: 3,
          third: true
        }
      }
    });
  });

  it('assert :: deep merge (with depth)', () => {
    const result = deepMerge(target, source, { depth: 0 });

    deepEqual(result, {
      level: 1,
      first: {
        level: 2,
        array: [1, 2, 3],
        second: {
          level: 3
        }
      }
    });
  });

  it('assert :: deep merge (with exclude)', () => {
    const result = deepMerge(target, source, {
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
        array: [4, 5, 6]
      }
    });
  });

  it('assert :: deep merge (with include)', () => {
    const result = deepMerge(target, source, {
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
