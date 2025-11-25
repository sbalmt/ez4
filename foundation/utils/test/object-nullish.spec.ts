import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { assertType, isNotNullishObject } from '@ez4/utils';

describe('object nullish utils', () => {
  type TestObject = {
    foo?: undefined | string;
    bar?: null | number;
    baz?: boolean;
  };

  it('assert :: is single property defined', () => {
    const test: TestObject = { foo: 'foo' };

    if (isNotNullishObject(test, 'foo')) {
      ok(assertType<typeof test, { foo: string }>(true));
    } else {
      ok(false);
    }
  });

  it('assert :: is multiple properties defined', () => {
    const test: TestObject = { foo: 'foo', bar: 123 };

    if (isNotNullishObject(test, 'foo', 'bar')) {
      ok(assertType<typeof test, { foo: string; bar: number }>(true));
    } else {
      ok(false);
    }
  });

  it('assert :: is all properties defined', () => {
    const test: TestObject = { foo: 'foo', bar: 123, baz: true };

    if (isNotNullishObject(test)) {
      ok(assertType<typeof test, { foo: string; bar: number; baz: boolean }>(true));
    } else {
      ok(false);
    }
  });
});
