import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteDeadLetterError, IncorrectDeadLetterTypeError, InvalidDeadLetterTypeError } from '@ez4/queue/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue deadletter metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete deadletter', () => {
    const [error1] = parseFile('incomplete-deadletter', 1);

    ok(error1 instanceof IncompleteDeadLetterError);
    deepEqual(error1.properties, ['maxRetries']);
  });

  it('assert :: incorrect deadletter', () => {
    const [error1] = parseFile('incorrect-deadletter', 1);

    ok(error1 instanceof IncorrectDeadLetterTypeError);
    equal(error1.baseType, 'Queue.DeadLetter');
    equal(error1.modelType, 'TestDeadLetter');
  });

  it('assert :: invalid deadletter (declaration)', () => {
    const [error1] = parseFile('invalid-deadletter-class', 1);

    ok(error1 instanceof InvalidDeadLetterTypeError);
    equal(error1.baseType, 'Queue.DeadLetter');
  });

  it('assert :: invalid deadletter (property)', () => {
    const [error1] = parseFile('invalid-deadletter-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
