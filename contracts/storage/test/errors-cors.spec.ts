import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '@ez4/storage/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/storage/library';

import { parseFile } from './common/parser';

describe('storage cors metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete cors', () => {
    const [error1] = parseFile('incomplete-cors', 1);

    ok(error1 instanceof IncompleteCorsError);
    deepEqual(error1.properties, ['allowOrigins']);
  });

  it('assert :: incorrect cors', () => {
    const [error1] = parseFile('incorrect-cors', 1);

    ok(error1 instanceof IncorrectCorsTypeError);
    equal(error1.baseType, 'Bucket.Cors');
    equal(error1.modelType, 'TestCors');
  });

  it('assert :: invalid cors (declaration)', () => {
    const [error1] = parseFile('invalid-cors-class', 1);

    ok(error1 instanceof InvalidCorsTypeError);
    equal(error1.baseType, 'Bucket.Cors');
  });

  it('assert :: invalid cors (property)', () => {
    const [error1] = parseFile('invalid-cors-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
