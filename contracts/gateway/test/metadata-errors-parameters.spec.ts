import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncorrectParameterTypeError, InvalidParameterTypeError } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http parameters metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect path parameters', () => {
    const [error1] = parseFile('incorrect-parameter', 1);

    ok(error1 instanceof IncorrectParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
    equal(error1.modelType, 'TestParameters');
  });

  it('assert :: invalid path parameters', () => {
    const [error1] = parseFile('invalid-parameter', 1);

    ok(error1 instanceof InvalidParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
  });
});
