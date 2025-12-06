import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncorrectHeadersTypeError, InvalidHeadersTypeError } from '@ez4/gateway/library';
import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http identity metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect headers', () => {
    const [error1] = parseFile('incorrect-headers', 1);

    ok(error1 instanceof IncorrectHeadersTypeError);
    equal(error1.baseType, 'Http.Headers');
    equal(error1.headersType, 'TestHeaders');
  });

  it('assert :: invalid headers', () => {
    const [error1] = parseFile('invalid-headers', 1);

    ok(error1 instanceof InvalidHeadersTypeError);
    equal(error1.baseType, 'Http.Headers');
  });
});
