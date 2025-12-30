import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncompleteHandlerError,
  IncompleteTargetError,
  IncompleteServiceError,
  IncorrectEventTypeError,
  InvalidEventTypeError
} from '@ez4/gateway/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('ws event metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect event', () => {
    const [error1, error2, error3, error4] = parseFile('incorrect-event', 4);

    ok(error1 instanceof IncorrectEventTypeError);
    equal(error1.baseType, 'Ws.Event');
    equal(error1.eventType, 'TestEvent');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['request']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['connect']);
  });

  it('assert :: invalid event (declaration)', () => {
    const [error1, error2, error3, error4] = parseFile('invalid-event-class', 4);

    ok(error1 instanceof InvalidEventTypeError);
    equal(error1.baseType, 'Ws.Event');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['request']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['connect']);
  });

  it('assert :: invalid event (property)', () => {
    const [error1] = parseFile('invalid-event-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
