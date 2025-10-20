import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncompleteAccessError, IncorrectAccessTypeError, InvalidAccessTypeError } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http access metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete access', () => {
    const [error1] = parseFile('incomplete-access', 1);

    ok(error1 instanceof IncompleteAccessError);
    deepEqual(error1.properties, ['logRetention']);
  });

  it('assert :: incorrect access', () => {
    const [error1] = parseFile('incorrect-access', 1);

    ok(error1 instanceof IncorrectAccessTypeError);
    equal(error1.baseType, 'Http.Access');
    equal(error1.modelType, 'TestAccess');
  });

  it('assert :: invalid access', () => {
    const [error1] = parseFile('invalid-access', 1);

    ok(error1 instanceof InvalidAccessTypeError);
    equal(error1.baseType, 'Http.Access');
  });
});
