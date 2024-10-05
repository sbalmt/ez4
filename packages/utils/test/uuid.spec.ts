import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isUUID } from '@ez4/utils';

describe.only('uuid format', () => {
  it('assert :: valid uuid', () => {
    ok(isUUID('6ba73a78-4b8f-11ef-9454-0242ac120002'));
    ok(isUUID('000003e8-4b8f-21ef-8d00-325096b39f47'));
    ok(isUUID('ab378953-fe9b-3499-add5-6180978c951c'));
    ok(isUUID('1cf8669f-b6ab-4489-8ebb-5a12b526f854'));
    ok(isUUID('da5b8893-d6ca-5c1c-9a9c-91f40a2a3649'));
    ok(isUUID('01925cb0-a4e3-7895-84b3-e2022b05e5d7'));
    ok(isUUID('07e80a05-0c28-8f17-8308-1c8ceed86c4a'));
  });

  it('assert :: invalid uuid', () => {
    ok(!isUUID('414cc694-5d00-0801-b045-48719521a8f2'));
  });
});
