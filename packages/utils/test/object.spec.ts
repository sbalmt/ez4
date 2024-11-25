import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isAnyObject, isEmptyObject } from '@ez4/utils';

describe.only('object utils', () => {
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
});
