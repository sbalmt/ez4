import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteTableError,
  IncorrectSchemaTypeError,
  IncorrectTableTypeError,
  InvalidSchemaTypeError,
  InvalidTableTypeError,
  registerTriggers
} from '@ez4/database/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('database service errors', () => {
  registerTriggers();

  it('assert :: incomplete table', () => {
    const [error1] = parseFile('incomplete-table', 1);

    ok(error1 instanceof IncompleteTableError);
    deepEqual(error1.properties, ['name', 'schema', 'indexes']);
  });

  it('assert :: incorrect table', () => {
    const [error1] = parseFile('incorrect-table', 1);

    ok(error1 instanceof IncorrectTableTypeError);
    equal(error1.baseType, 'Database.Table');
    equal(error1.tableType, 'TestTable');
  });

  it('assert :: invalid table (declaration)', () => {
    const [error1] = parseFile('invalid-table-class', 1);

    ok(error1 instanceof InvalidTableTypeError);
    equal(error1.baseType, 'Database.Table');
  });

  it('assert :: invalid table (property)', () => {
    const [error1] = parseFile('invalid-table-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });

  it('assert :: incorrect table schema', () => {
    const [error1, error2] = parseFile('incorrect-schema', 2);

    ok(error1 instanceof IncorrectSchemaTypeError);
    equal(error1.baseType, 'Database.Schema');
    equal(error1.schemaType, 'TestSchema');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid table schema', () => {
    const [error1, error2] = parseFile('invalid-schema', 2);

    ok(error1 instanceof InvalidSchemaTypeError);
    equal(error1.baseType, 'Database.Schema');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['schema']);
  });
});
