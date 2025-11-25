import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { assertType, isObjectWith } from '@ez4/utils';

describe('object with utils', () => {
  type TestObject = {
    foo?: undefined | string;
    bar?: null | number;
    baz?: boolean;
  };

  it('assert :: is with single property', () => {
    const test: TestObject = { foo: 'foo' };

    if (isObjectWith(test, ['foo'])) {
      ok(assertType<typeof test, { foo: string }>(true));
    } else {
      ok(false);
    }
  });

  it('assert :: is with multiple properties', () => {
    const test: TestObject = { foo: 'foo', bar: 123 };

    if (isObjectWith(test, ['foo', 'bar'])) {
      ok(assertType<typeof test, { foo: string; bar: number }>(true));
    } else {
      ok(false);
    }
  });

  it('assert :: is with all properties', () => {
    const test: TestObject = { foo: 'foo', bar: 123, baz: true };

    if (isObjectWith(test)) {
      ok(assertType<typeof test, { foo: string; bar: number; baz: boolean }>(true));
    } else {
      ok(false);
    }
  });
});
