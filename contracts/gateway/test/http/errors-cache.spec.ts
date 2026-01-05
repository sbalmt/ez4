import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteCacheError, IncorrectCacheTypeError, InvalidCacheTypeError } from '@ez4/gateway/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http cache metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete cache', () => {
    const [error1] = parseFile('incomplete-cache', 1);

    ok(error1 instanceof IncompleteCacheError);
    deepEqual(error1.properties, ['authorizerTTL']);
  });

  it('assert :: incorrect cache', () => {
    const [error1] = parseFile('incorrect-cache', 1);

    ok(error1 instanceof IncorrectCacheTypeError);
    equal(error1.baseType, 'Http.Cache');
    equal(error1.modelType, 'TestCache');
  });

  it('assert :: invalid cache (declaration)', () => {
    const [error1] = parseFile('invalid-cache-class', 1);

    ok(error1 instanceof InvalidCacheTypeError);
    equal(error1.baseType, 'Http.Cache');
  });

  it('assert :: invalid cache (property)', () => {
    const [error1] = parseFile('invalid-cache-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
