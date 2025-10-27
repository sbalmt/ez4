import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncorrectIdentityTypeError, InvalidIdentityTypeError } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http identity metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect identity', () => {
    const [error1] = parseFile('incorrect-identity', 1);

    ok(error1 instanceof IncorrectIdentityTypeError);
    equal(error1.baseType, 'Http.Identity');
    equal(error1.identityType, 'TestIdentity');
  });

  it('assert :: invalid identity', () => {
    const [error1] = parseFile('invalid-identity', 1);

    ok(error1 instanceof InvalidIdentityTypeError);
    equal(error1.baseType, 'Http.Identity');
  });
});
