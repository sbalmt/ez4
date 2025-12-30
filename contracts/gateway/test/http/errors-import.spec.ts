import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, registerTriggers } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('http import metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete http import', () => {
    const [error1] = parseFile('incomplete-import', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['project']);
  });
});
