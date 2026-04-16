import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteBackoffError, IncorrectBackoffTypeError, InvalidBackoffTypeError } from '@ez4/queue/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue backoff metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete backoff', () => {
    const [error1] = parseFile('incomplete-backoff', 1);

    ok(error1 instanceof IncompleteBackoffError);
    deepEqual(error1.properties, ['maxDelay']);
  });

  it('assert :: incorrect backoff', () => {
    const [error1] = parseFile('incorrect-backoff', 1);

    ok(error1 instanceof IncorrectBackoffTypeError);
    equal(error1.baseType, 'Queue.Backoff');
    equal(error1.modelType, 'TestBackoff');
  });

  it('assert :: invalid backoff (declaration)', () => {
    const [error1] = parseFile('invalid-backoff-class', 1);

    ok(error1 instanceof InvalidBackoffTypeError);
    equal(error1.baseType, 'Queue.Backoff');
  });

  it('assert :: invalid backoff (property)', () => {
    const [error1] = parseFile('invalid-backoff-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
