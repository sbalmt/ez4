import { equal, notEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hashObject } from '@ez4/utils';

describe('hash utils', () => {
  it('assert :: hash object (equal)', () => {
    const target = hashObject({ foo: 'foo', bar: 123 });
    const source = hashObject({ foo: 'foo', bar: 123 });

    equal(target, source);
  });

  it('assert :: hash object (not equal)', () => {
    const target = hashObject({ foo: 'foo', bar: 123 });
    const source = hashObject({ foo: 'foo', baz: 123 });

    notEqual(target, source);
  });
});
