import { ok, deepEqual, notEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isAnyObject,
  isEmptyObject,
  deepClone,
  deepCompare,
  deepEqual as deepEquals
} from '@ez4/utils';

describe.only('object utils', () => {
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

  it('assert :: is any object', () => {
    ok(isAnyObject({}));
  });

  it('assert :: is not an object', () => {
    ok(!isAnyObject(undefined));
    ok(!isAnyObject(null));
    ok(!isAnyObject(NaN));
  });

  it('assert :: is empty object', () => {
    ok(isEmptyObject({}));
  });

  it('assert :: is not empty object', () => {
    const result = isEmptyObject({
      foo: undefined
    });

    ok(!result);
  });

  it('assert :: deep clone', () => {
    const result = deepClone(object);

    deepEqual(result, object);
    notEqual(result, object);

    // Array reference has changed.
    notEqual(result.first.array, object.first.array);
  });

  it('assert :: deep clone (with exclude)', () => {
    const result = deepClone(object, {
      first: {
        second: true,
        level: false // do not exclude.
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

  it('assert :: deep equals', () => {
    const result = deepEquals(object, deepClone(object));

    ok(result);
  });

  it('assert :: deep equals (with exclude)', () => {
    const result = deepEquals(
      object,
      {
        level: 1,
        first: {
          level: 2,
          array: [1, 2, 3],
          second: 'changed!'
        }
      },
      {
        first: {
          second: true
        }
      }
    );

    ok(result);
  });

  it('assert :: deep compare', () => {
    const target = {
      level: 1,
      first: {
        level: 2,
        second: 'value'
      }
    };

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

  it('assert :: deep compare (with exclude)', () => {
    const target = {
      level: 1,
      first: {
        level: 2,
        second: 'value'
      }
    };

    const source = {
      first: {
        level: '2',
        second: {
          level: 3
        }
      }
    };

    const changes = deepCompare(target, source, {
      level: true,
      first: {
        level: true,
        second: true
      }
    });

    deepEqual(changes, {
      counts: 0
    });
  });
});
