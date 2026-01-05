import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteFallbackError, IncorrectFallbackTypeError, InvalidFallbackTypeError } from '@ez4/distribution/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution fallback metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete fallback', () => {
    const [error1] = parseFile('incomplete-fallback', 1);

    ok(error1 instanceof IncompleteFallbackError);
    deepEqual(error1.properties, ['location']);
  });

  it('assert :: incorrect fallback', () => {
    const [error1] = parseFile('incorrect-fallback', 1);

    ok(error1 instanceof IncorrectFallbackTypeError);
    deepEqual(error1.baseType, 'Cdn.Fallback');
    deepEqual(error1.fallbackType, 'TestFallback');
  });

  it('assert :: invalid fallback (declaration)', () => {
    const [error1] = parseFile('invalid-fallback-class', 1);

    ok(error1 instanceof InvalidFallbackTypeError);
    deepEqual(error1.baseType, 'Cdn.Fallback');
  });

  it('assert :: invalid fallback (property)', () => {
    const [error1] = parseFile('invalid-fallback-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
