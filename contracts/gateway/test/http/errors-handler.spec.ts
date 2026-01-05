import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteRouteError, IncompleteHandlerError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('http handler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete route handler', () => {
    const [error1, error2] = parseFile('incomplete-handler', 2);

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['response']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });
});
