import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isAnyObject, isPlainObject } from '@ez4/utils';

describe('object utils', () => {
  it('assert :: is any object', () => {
    ok(isAnyObject(new (class {})()));
    ok(isAnyObject({}));
  });

  it('assert :: is not an object', () => {
    ok(!isAnyObject(undefined));
    ok(!isAnyObject(null));
    ok(!isAnyObject(NaN));
    ok(!isAnyObject([]));
  });

  it('assert :: is plain object', () => {
    ok(isPlainObject({}));
  });

  it('assert :: is not plain object', () => {
    ok(!isPlainObject(new (class {})()));
    ok(!isPlainObject(undefined));
    ok(!isPlainObject(null));
    ok(!isPlainObject(NaN));
    ok(!isPlainObject([]));
  });
});
