import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isEmptyObject } from '@ez4/utils';

describe('object empty utils', () => {
  it('assert :: is empty object', () => {
    ok(isEmptyObject({ foo: { bar: undefined } }));
    ok(isEmptyObject({ foo: undefined }));
    ok(isEmptyObject({}));
  });

  it('assert :: is not empty object', () => {
    ok(!isEmptyObject({ foo: { bar: 123 } }));
    ok(!isEmptyObject({ foo: null }));
    ok(!isEmptyObject([1, 2, 3]));
  });
});
