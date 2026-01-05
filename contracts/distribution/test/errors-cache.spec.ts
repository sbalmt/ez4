import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteCacheError, IncorrectCacheTypeError, InvalidCacheTypeError } from '@ez4/distribution/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution cache metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete cache', () => {
    const [error1] = parseFile('incomplete-cache', 1);

    ok(error1 instanceof IncompleteCacheError);
    deepEqual(error1.properties, ['ttl']);
  });

  it('assert :: incorrect cache', () => {
    const [error1] = parseFile('incorrect-cache', 1);

    ok(error1 instanceof IncorrectCacheTypeError);
    deepEqual(error1.baseType, 'Cdn.Cache');
    deepEqual(error1.cacheType, 'TestCache');
  });

  it('assert :: invalid cache (declaration)', () => {
    const [error1] = parseFile('invalid-cache-class', 1);

    ok(error1 instanceof InvalidCacheTypeError);
    deepEqual(error1.baseType, 'Cdn.Cache');
  });

  it('assert :: invalid cache (property)', () => {
    const [error1] = parseFile('invalid-cache-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
