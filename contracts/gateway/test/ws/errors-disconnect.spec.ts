import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteTargetError, IncompleteServiceError } from '@ez4/gateway/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('ws disconnect metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service disconnect', () => {
    const [error1, error2] = parseFile('incomplete-disconnect', 2);

    ok(error1 instanceof IncompleteTargetError);
    deepEqual(error1.properties, ['handler']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['disconnect']);
  });

  it('assert :: invalid disconnect property', () => {
    const [error1] = parseFile('invalid-disconnect-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
