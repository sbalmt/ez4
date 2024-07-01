import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isUUID } from '@ez4/utils';

describe.only('uuid format', () => {
  it('assert :: uuid v1', () => {
    ok(isUUID('6ba73a78-4b8f-11ef-9454-0242ac120002'));
  });

  it('assert :: uuid v2', () => {
    ok(isUUID('000003e8-4b8f-21ef-8d00-325096b39f47'));
  });

  it('assert :: uuid v3', () => {
    ok(isUUID('ab378953-fe9b-3499-add5-6180978c951c'));
  });

  it('assert :: uuid v4', () => {
    ok(isUUID('1cf8669f-b6ab-4489-8ebb-5a12b526f854'));
  });

  it('assert :: uuid v5', () => {
    ok(isUUID('da5b8893-d6ca-5c1c-9a9c-91f40a2a3649'));
  });

  it('assert :: invalid uuid', () => {
    // Passing version 6 (not valid so far)
    ok(!isUUID('414cc694-5d00-0801-b045-48719521a8f2'));
  });
});
