import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';
import { InvalidServicePropertyError } from '@ez4/common/library';

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

  it('assert :: invalid cors (declaration)', () => {
    const [error1] = parseFile('invalid-cors-class', 1);

    ok(error1 instanceof InvalidCorsTypeError);
    equal(error1.baseType, 'Http.Cors');
  });

  it('assert :: invalid cache (property)', () => {
    const [error1] = parseFile('invalid-cors-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
