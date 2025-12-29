import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteEventError, IncorrectEventTypeError, InvalidEventTypeError } from '@ez4/storage/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/storage/library';

import { parseFile } from './common/parser';

describe('storage events metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete events', () => {
    const [error1] = parseFile('incomplete-events', 1);

    ok(error1 instanceof IncompleteEventError);
    deepEqual(error1.properties, ['handler']);
  });

  it('assert :: incorrect events', () => {
    const [error1] = parseFile('incorrect-events', 1);

    ok(error1 instanceof IncorrectEventTypeError);
    equal(error1.baseType, 'Bucket.Event');
    equal(error1.modelType, 'TestEvent');
  });

  it('assert :: invalid events (declaration)', () => {
    const [error1] = parseFile('invalid-events-class', 1);

    ok(error1 instanceof InvalidEventTypeError);
    equal(error1.baseType, 'Bucket.Event');
  });

  it('assert :: invalid events (property)', () => {
    const [error1] = parseFile('invalid-events-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
