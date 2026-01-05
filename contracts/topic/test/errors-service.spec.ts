import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { InvalidServicePropertyError } from '@ez4/common/library';
import { IncompleteServiceError, registerTriggers } from '@ez4/topic/library';

import { parseFile } from './common/parser';

describe('topic service metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete topic service', () => {
    const [error1, error2] = parseFile('incomplete-service', 2);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['subscriptions']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid topic property', () => {
    const [error1] = parseFile('invalid-service-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
