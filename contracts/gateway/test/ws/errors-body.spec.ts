import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectBodyTypeError, InvalidBodyTypeError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('ws body metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect body', () => {
    const [error1] = parseFile('incorrect-body', 1);

    ok(error1 instanceof IncorrectBodyTypeError);
    equal(error1.baseType, 'Ws.JsonBody');
    equal(error1.modelType, 'TestBody');
  });

  it('assert :: invalid body', () => {
    const [error1] = parseFile('invalid-body', 1);

    ok(error1 instanceof InvalidBodyTypeError);
    equal(error1.baseType, 'Ws.JsonBody');
  });
});
