import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteScalabilityError,
  IncorrectScalabilityTypeError,
  InvalidScalabilityTypeError,
  registerTriggers
} from '@ez4/database/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('database scalability errors', () => {
  registerTriggers();

  it('assert :: incomplete scalability', () => {
    const [error1] = parseFile('incomplete-scalability', 1);

    ok(error1 instanceof IncompleteScalabilityError);
    deepEqual(error1.properties, ['minCapacity', 'maxCapacity']);
  });

  it('assert :: incorrect scalability', () => {
    const [error1] = parseFile('incorrect-scalability', 1);

    ok(error1 instanceof IncorrectScalabilityTypeError);
    equal(error1.baseType, 'Database.Scalability');
    equal(error1.scalabilityType, 'TestScalability');
  });

  it('assert :: invalid scalability (declaration)', () => {
    const [error1] = parseFile('invalid-scalability-class', 1);

    ok(error1 instanceof InvalidScalabilityTypeError);
    equal(error1.baseType, 'Database.Scalability');
  });

  it('assert :: invalid scalability (property)', () => {
    const [error1] = parseFile('invalid-scalability-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
