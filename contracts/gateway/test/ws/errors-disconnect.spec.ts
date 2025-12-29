import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteTargetError, IncompleteServiceError } from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('ws disconnect metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service disconnect', () => {
    const [error1, error2] = parseFile('incomplete-disconnect', 2);

    ok(error1 instanceof IncompleteTargetError);
    deepEqual(error1.properties, ['handler']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['disconnect']);
  });
});
