import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue import metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete queue import', () => {
    const [error1] = parseFile('incomplete-import', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['project']);
  });
});
