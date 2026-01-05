import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteHandlerError, IncompleteServiceError, IncompleteTargetError, InvalidEventTypeError } from '@ez4/scheduler/library';
import { registerTriggers } from '@ez4/scheduler/library';

import { parseFile } from './common/parser';

describe('scheduler handler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete handler', () => {
    const [error1, error2, error3, error4] = parseFile('incomplete-handler', 4);

    ok(error1 instanceof InvalidEventTypeError);
    deepEqual(error1.baseType, 'Cron.Event');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['request']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['target']);
  });
});
