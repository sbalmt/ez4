import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, IncompleteTargetError, IncorrectServiceError } from '@ez4/scheduler/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/scheduler/library';

import { parseFile } from './common/parser';

describe('scheduler service metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete scheduler', () => {
    const [error1, error2, error3, error4, error5] = parseFile('incomplete-service', 5);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['target']);

    ok(error2 instanceof IncompleteTargetError);
    deepEqual(error2.properties, ['handler']);

    ok(error3 instanceof IncompleteServiceError);
    deepEqual(error3.properties, ['target']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['expression']);

    ok(error5 instanceof IncompleteServiceError);
    deepEqual(error5.properties, ['schema']);
  });

  it('assert :: incorrect scheduler', () => {
    const [error1] = parseFile('incorrect-service', 1);

    ok(error1 instanceof IncorrectServiceError);
    deepEqual(error1.properties, ['disabled', 'timezone', 'startDate', 'endDate']);
  });

  it('assert :: invalid service property', () => {
    const [error1] = parseFile('invalid-service-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
