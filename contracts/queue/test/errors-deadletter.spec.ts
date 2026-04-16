import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteDeadLetterError, IncorrectDeadLetterTypeError, InvalidDeadLetterTypeError } from '@ez4/queue/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue dead-letter metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete dead-letter', () => {
    const [error1] = parseFile('incomplete-deadletter', 1);

    ok(error1 instanceof IncompleteDeadLetterError);
    deepEqual(error1.properties, ['maxRetries']);
  });

  it('assert :: incorrect dead-letter', () => {
    const [error1] = parseFile('incorrect-deadletter', 1);

    ok(error1 instanceof IncorrectDeadLetterTypeError);
    equal(error1.baseType, 'Queue.DeadLetter');
    equal(error1.modelType, 'TestDeadLetter');
  });

  it('assert :: invalid dead-letter (declaration)', () => {
    const [error1] = parseFile('invalid-deadletter-class', 1);

    ok(error1 instanceof InvalidDeadLetterTypeError);
    equal(error1.baseType, 'Queue.DeadLetter');
  });

  it('assert :: invalid dead-letter (property)', () => {
    const [error1] = parseFile('invalid-deadletter-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
