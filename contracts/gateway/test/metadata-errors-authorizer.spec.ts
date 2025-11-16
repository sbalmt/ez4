import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncorrectRequestTypeError, InvalidRequestTypeError } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http authorizer metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect authorizer request', () => {
    const [error1] = parseFile('incorrect-authorizer', 1);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Http.AuthRequest');
    equal(error1.modelType, 'TestAuthRequest');
  });

  it('assert :: invalid authorizer request', () => {
    const [error1] = parseFile('invalid-authorizer', 1);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Http.AuthRequest');
  });
});
