import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deepCompare, deepEqual as deepEquals, isAnyArray, isAnyObject } from '@ez4/utils';

describe('object comparison utils', () => {
  const target = {
    level: 1,
    first: {
      level: 2,
      second: 'value'
    }
  };

  it('assert :: deep compare', () => {
    const source = {
      // level: 1 Create.
      first: {
        level: '2',
        second: { level: 3 }, // Update.
        another: 'foo' // Remove.
      }
    };

    const changes = deepCompare(target, source);

    deepEqual(changes, {
      counts: 2,
      create: {
        level: 1
      },
      nested: {
        first: {
          counts: 3,
          update: {
            level: 2,
            second: 'value'
          },
          remove: {
            another: 'foo'
          }
        }
      }
    });
  });

  it('assert :: deep compare (with depth)', () => {
    const source = {
      level: 1,
      first: target.first
    };

    const changes = deepCompare(target, source, { depth: 0 });

    deepEqual(changes, {
      counts: 0
    });
  });

  it('assert :: deep compare (with exclude)', () => {
    const source = {
      first: {
        level: 2,
        second: {
          level: 'value'
        }
      }
    };

    const changes = deepCompare(target, source, {
      exclude: {
        level: true,
        first: {
          second: true
        }
      }
    });

    deepEqual(changes, {
      counts: 0
    });
  });

  it('assert :: deep compare (with include)', () => {
    const source = {
      first: {
        level: 2,
        second: {
          level: 'value'
        }
      }
    };

    const changes = deepCompare(target, source, {
      include: {
        first: {
          level: true
        }
      }
    });

    deepEqual(changes, {
      counts: 0
    });
  });

  it('assert :: deep compare (rename)', () => {
    const source = {
      level: 1,
      first_old: {
        level: 2,
        second: 'value'
      }
    };

    const changes = deepCompare(target, source);

    deepEqual(changes, {
      counts: 1,
      rename: {
        first_old: 'first'
      }
    });
  });

  it('assert :: deep compare (custom rename)', () => {
    const source = {
      level: 1,
      FIRST_OLD: {
        level: 2,
        second: 'value'
      }
    };

    const changes = deepCompare(target, source, {
      onRename: (targetKey, sourceKey, targetValue, sourceValue) => {
        const lcTargetKey = targetKey.toLowerCase();
        const lcSourceKey = sourceKey.toLowerCase();

        if (!lcTargetKey.includes(lcSourceKey) && !lcSourceKey.includes(lcTargetKey)) {
          return false;
        }

        if ((isAnyObject(targetValue) && isAnyObject(sourceValue)) || (isAnyArray(targetValue) && isAnyArray(sourceValue))) {
          return deepEquals(targetValue, sourceValue);
        }

        return targetValue === sourceValue;
      }
    });

    deepEqual(changes, {
      counts: 1,
      rename: {
        FIRST_OLD: 'first'
      }
    });
  });
});
