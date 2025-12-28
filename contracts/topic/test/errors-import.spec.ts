import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, registerTriggers } from '@ez4/topic/library';
import { parseFile } from './common/parser';

describe('topic import metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete topic import', () => {
    const [error1] = parseFile('incomplete-import', 1, true);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['project']);
  });
});
