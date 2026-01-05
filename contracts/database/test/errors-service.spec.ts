import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, registerTriggers } from '@ez4/database/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('database service errors', () => {
  registerTriggers();

  it('assert :: incomplete database', () => {
    const [error1] = parseFile('incomplete-database', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['engine', 'tables']);
  });

  it('assert :: invalid service property', () => {
    const [error1] = parseFile('invalid-service-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
