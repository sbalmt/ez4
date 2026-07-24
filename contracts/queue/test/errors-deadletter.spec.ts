import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteDeadLetterError, IncorrectDeadLetterTypeError, InvalidDeadLetterTypeError } from '@ez4/queue/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue dead-letter metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete dead-letter', () => {
    const [error] = parseFile('incomplete-deadletter', 1);

    ok(error instanceof IncompleteDeadLetterError);
    deepEqual(error.properties, ['maxAttempts']);
  });

  it('assert :: incorrect dead-letter', () => {
    const [error] = parseFile('incorrect-deadletter', 1);

    ok(error instanceof IncorrectDeadLetterTypeError);
    equal(error.baseType, 'Queue.DeadLetter');
    equal(error.modelType, 'TestDeadLetter');
  });

  it('assert :: invalid dead-letter (declaration)', () => {
    const [error] = parseFile('invalid-deadletter-class', 1);

    ok(error instanceof InvalidDeadLetterTypeError);
    equal(error.baseType, 'Queue.DeadLetter');
  });

  it('assert :: invalid dead-letter (property)', () => {
    const [error] = parseFile('invalid-deadletter-property', 1);

    ok(error instanceof InvalidServicePropertyError);
    equal(error.propertyName, 'invalid_property');
  });
});
