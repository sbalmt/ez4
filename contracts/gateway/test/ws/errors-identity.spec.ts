import { ok, deepEqual, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncorrectIdentityTypeError,
  IncompleteAuthorizerHandlerError,
  InvalidIdentityTypeError
} from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('ws identity metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect identity', () => {
    const [error1, error2] = parseFile('incorrect-identity', 2);

    ok(error1 instanceof IncorrectIdentityTypeError);
    equal(error1.baseType, 'Ws.Identity');
    equal(error1.identityType, 'TestIdentity');

    ok(error2 instanceof IncompleteAuthorizerHandlerError);
    deepEqual(error2.properties, ['response']);
  });

  it('assert :: invalid identity', () => {
    const [error1, error2] = parseFile('invalid-identity', 2);

    ok(error1 instanceof InvalidIdentityTypeError);
    equal(error1.baseType, 'Ws.Identity');

    ok(error2 instanceof IncompleteAuthorizerHandlerError);
    deepEqual(error2.properties, ['response']);
  });
});
