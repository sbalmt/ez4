import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError } from '@ez4/database/library';

import { registerTriggers } from '@ez4/database/library';
import { parseFile } from './common/parser';

describe('database service errors', () => {
  registerTriggers();

  it('assert :: incomplete database', () => {
    const [error1] = parseFile('incomplete-database', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['engine', 'tables']);
  });
});
