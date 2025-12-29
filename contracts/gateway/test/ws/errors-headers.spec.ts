import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectHeadersTypeError, InvalidHeadersTypeError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('ws identity metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect headers', () => {
    const [error1] = parseFile('incorrect-headers', 1);

    ok(error1 instanceof IncorrectHeadersTypeError);
    equal(error1.baseType, 'Ws.Headers');
    equal(error1.headersType, 'TestHeaders');
  });

  it('assert :: invalid headers', () => {
    const [error1] = parseFile('invalid-headers', 1);

    ok(error1 instanceof InvalidHeadersTypeError);
    equal(error1.baseType, 'Ws.Headers');
  });
});
