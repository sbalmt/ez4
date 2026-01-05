import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/storage/library';

import { parseFile } from './common/parser';

describe('storage service metadata errors', () => {
  registerTriggers();

  it('assert :: invalid storage property', () => {
    const [error1] = parseFile('invalid-service-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
