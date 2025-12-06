import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncorrectQueryTypeError, InvalidQueryTypeError } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http query metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect query strings', () => {
    const [error1] = parseFile('incorrect-query', 1);

    ok(error1 instanceof IncorrectQueryTypeError);
    equal(error1.baseType, 'Http.QueryStrings');
    equal(error1.queryType, 'TestQueryStrings');
  });

  it('assert :: invalid query strings', () => {
    const [error1] = parseFile('invalid-query', 1);

    ok(error1 instanceof InvalidQueryTypeError);
    equal(error1.baseType, 'Http.QueryStrings');
  });
});
