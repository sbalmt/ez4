import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncompleteAccessError, IncorrectAccessTypeError, InvalidAccessTypeError } from '@ez4/gateway/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http access metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete access', () => {
    const [error1] = parseFile('incomplete-access', 1);

    ok(error1 instanceof IncompleteAccessError);
    deepEqual(error1.properties, ['logRetention']);
  });

  it('assert :: incorrect access', () => {
    const [error1] = parseFile('incorrect-access', 1);

    ok(error1 instanceof IncorrectAccessTypeError);
    equal(error1.baseType, 'Http.Access');
    equal(error1.modelType, 'TestAccess');
  });

  it('assert :: invalid access (declaration)', () => {
    const [error1] = parseFile('invalid-access-class', 1);

    ok(error1 instanceof InvalidAccessTypeError);
    equal(error1.baseType, 'Http.Access');
  });

  it('assert :: invalid access (property)', () => {
    const [error1] = parseFile('invalid-access-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
