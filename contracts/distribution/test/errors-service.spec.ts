import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError } from '@ez4/distribution/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution service metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete distribution', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['defaultOrigin']);
  });

  it('assert :: invalid distribution property', () => {
    const [error1] = parseFile('invalid-service-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
