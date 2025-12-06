import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteRouteError } from '@ez4/gateway/library';

import { parseFile } from './utils/parser';

describe('http route metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service routes', () => {
    const [error1, error2] = parseFile('incomplete-route', 2);

    ok(error1 instanceof IncompleteRouteError);
    deepEqual(error1.properties, ['path']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });
});
