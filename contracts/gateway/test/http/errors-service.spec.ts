import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteServiceError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('http service metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['routes']);
  });
});
