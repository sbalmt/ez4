import { deepEqual, equal, ok } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteRewriteRuleError, InvalidRewriteStatusError, registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution rewrite metadata errors', () => {
  registerTriggers();

  it('assert :: invalid rewrite status', () => {
    const [error] = parseFile('invalid-rewrite-status', 1);

    ok(error instanceof InvalidRewriteStatusError);
    equal(error.status, 308);
  });

  it('assert :: incomplete rewrite rule', () => {
    const [error] = parseFile('incomplete-rewrite-rule', 1);

    ok(error instanceof IncompleteRewriteRuleError);
    deepEqual(error.properties, ['to']);
  });
});
