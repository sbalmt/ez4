import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '@ez4/gateway/library';

import { parseFile } from './utils/parser';

describe('ws defaults metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect defaults', () => {
    const [error1] = parseFile('incorrect-defaults', 1);

    ok(error1 instanceof IncorrectDefaultsTypeError);
    equal(error1.baseType, 'Ws.Defaults');
    equal(error1.defaultsType, 'TestDefaults');
  });

  it('assert :: invalid defaults', () => {
    const [error1] = parseFile('invalid-defaults', 1);

    ok(error1 instanceof InvalidDefaultsTypeError);
    equal(error1.baseType, 'Ws.Defaults');
  });
});
