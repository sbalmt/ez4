import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '@ez4/gateway/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http defaults metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect defaults', () => {
    const [error1] = parseFile('incorrect-defaults', 1);

    ok(error1 instanceof IncorrectDefaultsTypeError);
    equal(error1.baseType, 'Http.Defaults');
    equal(error1.defaultsType, 'TestDefaults');
  });

  it('assert :: invalid defaults (declaration)', () => {
    const [error1] = parseFile('invalid-defaults-class', 1);

    ok(error1 instanceof InvalidDefaultsTypeError);
    equal(error1.baseType, 'Http.Defaults');
  });

  it('assert :: invalid cache (property)', () => {
    const [error1] = parseFile('invalid-defaults-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
