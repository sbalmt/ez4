import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http cors metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete cors', () => {
    const [error1] = parseFile('incomplete-cors', 1);

    ok(error1 instanceof IncompleteCorsError);
    deepEqual(error1.properties, ['allowOrigins']);
  });

  it('assert :: incorrect cors', () => {
    const [error1] = parseFile('incorrect-cors', 1);

    ok(error1 instanceof IncorrectCorsTypeError);
    equal(error1.baseType, 'Http.Cors');
    equal(error1.modelType, 'TestCors');
  });

  it('assert :: invalid cors', () => {
    const [error1] = parseFile('invalid-cors', 1);

    ok(error1 instanceof InvalidCorsTypeError);
    equal(error1.baseType, 'Http.Cors');
  });
});
