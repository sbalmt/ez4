import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '@ez4/gateway/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('ws defaults metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect defaults', () => {
    const [error1] = parseFile('incorrect-defaults', 1);

    ok(error1 instanceof IncorrectDefaultsTypeError);
    equal(error1.baseType, 'Ws.Defaults');
    equal(error1.defaultsType, 'TestDefaults');
  });

  it('assert :: invalid defaults (declaration)', () => {
    const [error1] = parseFile('invalid-defaults-class', 1);

    ok(error1 instanceof InvalidDefaultsTypeError);
    equal(error1.baseType, 'Ws.Defaults');
  });

  it('assert :: invalid defaults (property)', () => {
    const [error1] = parseFile('invalid-defaults-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
