import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, IncompleteTargetError, IncorrectTargetTypeError, InvalidTargetTypeError } from '@ez4/scheduler/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/scheduler/library';

import { parseFile } from './common/parser';

describe('scheduler target metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete target', () => {
    const [error1, error2] = parseFile('incomplete-target', 2);

    ok(error1 instanceof IncompleteTargetError);
    deepEqual(error1.properties, ['handler']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['target']);
  });

  it('assert :: incorrect target', () => {
    const [error1, error2] = parseFile('incorrect-target', 2);

    ok(error1 instanceof IncorrectTargetTypeError);
    deepEqual(error1.baseType, 'Cron.Target');
    deepEqual(error1.targetType, 'TestTarget');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['target']);
  });

  it('assert :: invalid target (declaration)', () => {
    const [error1, error2] = parseFile('invalid-target-class', 2);

    ok(error1 instanceof InvalidTargetTypeError);
    deepEqual(error1.baseType, 'Cron.Target');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['target']);
  });

  it('assert :: invalid target (property)', () => {
    const [error1] = parseFile('invalid-target-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
