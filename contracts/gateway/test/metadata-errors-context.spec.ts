import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncompleteContextError, InvalidContextTypeError } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http context metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete route context', () => {
    const [error1, error2] = parseFile('incomplete-context', 2);

    ok(error1 instanceof IncompleteContextError);
    deepEqual(error1.properties, ['services']);

    ok(error2 instanceof IncompleteContextError);
    deepEqual(error2.properties, ['services']);
  });

  it('assert :: invalid route context', () => {
    const [error1] = parseFile('invalid-context', 1);

    ok(error1 instanceof InvalidContextTypeError);
    equal(error1.baseType, 'Http.Provider');
  });
});
