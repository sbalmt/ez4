import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteProviderError, InvalidProviderTypeError } from '@ez4/gateway/library';
import { registerTriggers, getHttpServices, ServiceCollisionError } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http provider metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete route provider', () => {
    const [error1, error2] = parseFile('incomplete-provider', 2);

    ok(error1 instanceof IncompleteProviderError);
    deepEqual(error1.properties, ['services']);

    ok(error2 instanceof IncompleteProviderError);
    deepEqual(error2.properties, ['services']);
  });

  it('assert :: invalid route provider', () => {
    const [error1] = parseFile('invalid-provider', 1);

    ok(error1 instanceof InvalidProviderTypeError);
    equal(error1.baseType, 'Http.Provider');
  });

  it('assert :: collided provider service', () => {
    const [error1] = parseFile('collided-service', 1);

    ok(error1 instanceof ServiceCollisionError);
    equal(error1.property, 'selfClient');
  });
});
