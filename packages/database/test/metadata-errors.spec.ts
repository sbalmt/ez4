import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteTableError,
  IncorrectSchemaTypeError,
  InvalidSchemaTypeError
} from '@ez4/database/library';

import { getReflection } from '@ez4/project';
import { registerTriggers, getDatabaseServices } from '@ez4/database/library';

const parseFile = (fileName: string) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getDatabaseServices(reflection);

  return result.errors;
};

describe.only('database metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete database', () => {
    const errors = parseFile('incomplete-database');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['name']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['tables']);
  });

  it('assert :: incomplete table', () => {
    const errors = parseFile('incomplete-table');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteTableError);
    deepEqual(error1.properties, ['name', 'schema']);
  });

  it('assert :: incorrect table schema', () => {
    const errors = parseFile('incorrect-schema');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncorrectSchemaTypeError);
    equal(error1.baseType, 'Database.Schema');
    equal(error1.schemaType, 'TestSchema');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid table schema', () => {
    const errors = parseFile('invalid-schema');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof InvalidSchemaTypeError);
    equal(error1.baseType, 'Database.Schema');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['schema']);
  });
});
