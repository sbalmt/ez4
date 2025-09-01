import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteEngineError } from '@ez4/database/library';
import { registerTriggers } from '@ez4/database/library';

import { parseFile } from './common/parser';

describe('database engine errors', () => {
  registerTriggers();

  it('assert :: incomplete scalability', () => {
    const [error1] = parseFile('incomplete-engine', 1);

    ok(error1 instanceof IncompleteEngineError);
    deepEqual(error1.properties, ['name']);
  });
});
