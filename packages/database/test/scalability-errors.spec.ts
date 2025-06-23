import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteScalabilityError } from '@ez4/database/library';
import { registerTriggers } from '@ez4/database/library';

import { parseFile } from './common/parser.js';

describe('database scalability errors', () => {
  registerTriggers();

  it('assert :: incomplete scalability', () => {
    const [error1] = parseFile('incomplete-scalability', 1);

    ok(error1 instanceof IncompleteScalabilityError);
    deepEqual(error1.properties, ['minCapacity', 'maxCapacity']);
  });
});
