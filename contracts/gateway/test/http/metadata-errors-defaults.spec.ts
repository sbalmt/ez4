import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http defaults metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect defaults', () => {
    const [error1] = parseFile('incorrect-defaults', 1);

    ok(error1 instanceof IncorrectDefaultsTypeError);
    equal(error1.baseType, 'Http.Defaults');
    equal(error1.defaultsType, 'TestDefaults');
  });

  it('assert :: invalid defaults', () => {
    const [error1] = parseFile('invalid-defaults', 1);

    ok(error1 instanceof InvalidDefaultsTypeError);
    equal(error1.baseType, 'Http.Defaults');
  });
});
