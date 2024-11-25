import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteTableError,
  IncorrectSchemaTypeError,
  InvalidSchemaTypeError
} from '@ez4/database/library';

import { registerTriggers } from '@ez4/database/library';
import { parseFile } from './common/parser.js';

describe.only('database service errors', () => {
  registerTriggers();

  it('assert :: incomplete database', () => {
    const [error1] = parseFile('incomplete-database', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['engine', 'tables']);
  });

  it('assert :: incomplete table', () => {
    const [error1] = parseFile('incomplete-table', 1);

    ok(error1 instanceof IncompleteTableError);
    deepEqual(error1.properties, ['name', 'schema', 'indexes']);
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
