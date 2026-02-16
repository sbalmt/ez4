import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { InvalidServicePropertyError } from '@ez4/common/library';
import { IncompleteServiceError, registerTriggers } from '@ez4/cache/library';

import { parseFile } from './common/parser';

describe('cache service metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete cache service', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['engine']);
  });

  it('assert :: invalid cache property', () => {
    const [error1] = parseFile('invalid-service-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
