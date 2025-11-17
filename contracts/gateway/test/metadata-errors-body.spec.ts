import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncorrectBodyTypeError, InvalidBodyTypeError } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http body metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect body', () => {
    const [error1] = parseFile('incorrect-body', 1);

    ok(error1 instanceof IncorrectBodyTypeError);
    equal(error1.baseType, 'Http.JsonBody');
    equal(error1.modelType, 'TestBody');
  });

  it('assert :: invalid body', () => {
    const [error1] = parseFile('invalid-body', 1);

    ok(error1 instanceof InvalidBodyTypeError);
    equal(error1.baseType, 'Http.JsonBody');
  });
});
