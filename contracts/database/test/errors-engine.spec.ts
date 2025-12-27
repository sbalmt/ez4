import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteEngineError, IncompleteServiceError } from '@ez4/database/library';
import { registerTriggers } from '@ez4/database/library';

import { parseFile } from './common/parser';

describe('database engine errors', () => {
  registerTriggers();

  it('assert :: incomplete engine', () => {
    const [error1, error2] = parseFile('incomplete-engine', 2);

    ok(error1 instanceof IncompleteEngineError);
    deepEqual(error1.properties, ['name']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['engine']);
  });
});
