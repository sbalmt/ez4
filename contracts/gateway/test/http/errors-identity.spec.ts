import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectIdentityTypeError, InvalidIdentityTypeError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('http identity metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect identity', () => {
    const [error1] = parseFile('incorrect-identity', 1);

    ok(error1 instanceof IncorrectIdentityTypeError);
    equal(error1.baseType, 'Http.Identity');
    equal(error1.identityType, 'TestIdentity');
  });

  it('assert :: invalid identity', () => {
    const [error1] = parseFile('invalid-identity', 1);

    ok(error1 instanceof InvalidIdentityTypeError);
    equal(error1.baseType, 'Http.Identity');
  });
});
