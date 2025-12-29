import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectQueryTypeError, InvalidQueryTypeError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('ws query metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect query strings', () => {
    const [error1] = parseFile('incorrect-query', 1);

    ok(error1 instanceof IncorrectQueryTypeError);
    equal(error1.baseType, 'Ws.QueryStrings');
    equal(error1.queryType, 'TestQueryStrings');
  });

  it('assert :: invalid query strings', () => {
    const [error1] = parseFile('invalid-query', 1);

    ok(error1 instanceof InvalidQueryTypeError);
    equal(error1.baseType, 'Ws.QueryStrings');
  });
});
