import { deepEqual, equal, ok } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteRewriteRuleError,
  IncorrectRewriteRuleTypeError,
  InvalidRewriteRuleTypeError,
  InvalidRewriteStatusError
} from '@ez4/distribution/library';

import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution rewrite metadata errors', () => {
  registerTriggers();

  it('assert :: invalid rewrite status', () => {
    const [error] = parseFile('invalid-rewrite-status', 1);

    ok(error instanceof InvalidRewriteStatusError);
    equal(error.status, 308);
  });

  it('assert :: incomplete rewrite rule', () => {
    const [error] = parseFile('incomplete-rewrite', 1);

    ok(error instanceof IncompleteRewriteRuleError);
    deepEqual(error.properties, ['to']);
  });

  it('assert :: incorrect rewrite rule', () => {
    const [error] = parseFile('incorrect-rewrite', 1);

    ok(error instanceof IncorrectRewriteRuleTypeError);
    equal(error.baseType, 'Cdn.RewriteRule');
    equal(error.rewriteRuleType, 'TestRewriteRule');
  });

  it('assert :: invalid subscription (declaration)', () => {
    const [error] = parseFile('invalid-rewrite-class', 1);

    ok(error instanceof InvalidRewriteRuleTypeError);
    equal(error.baseType, 'Cdn.RewriteRule');
  });

  it('assert :: invalid rewrite rule (property)', () => {
    const [error] = parseFile('invalid-rewrite-property', 1);

    ok(error instanceof InvalidServicePropertyError);
    deepEqual(error.propertyName, 'invalid_property');
  });
});
