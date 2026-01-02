import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteEngineError,
  IncompleteServiceError,
  IncorrectEngineTypeError,
  InvalidEngineTypeError,
  registerTriggers
} from '@ez4/database/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('database engine errors', () => {
  registerTriggers();

  it('assert :: incomplete engine', () => {
    const [error1, error2] = parseFile('incomplete-engine', 2);

    ok(error1 instanceof IncompleteEngineError);
    deepEqual(error1.properties, ['name']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['engine']);
  });

  it('assert :: incorrect engine', () => {
    const [error1, error2] = parseFile('incorrect-engine', 2);

    ok(error1 instanceof IncorrectEngineTypeError);
    equal(error1.baseType, 'Database.Engine');
    equal(error1.engineType, 'TestEngine');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['engine']);
  });

  it('assert :: invalid engine (declaration)', () => {
    const [error1, error2] = parseFile('invalid-engine-class', 2);

    ok(error1 instanceof InvalidEngineTypeError);
    equal(error1.baseType, 'Database.Engine');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['engine']);
  });

  it('assert :: invalid engine (property)', () => {
    const [error1] = parseFile('invalid-engine-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
