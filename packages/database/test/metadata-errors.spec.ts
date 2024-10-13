import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteHandlerError,
  IncompleteServiceError,
  IncompleteStreamError,
  IncompleteTableError,
  IncorrectSchemaTypeError,
  IncorrectIndexesTypeError,
  InvalidSchemaTypeError,
  InvalidIndexesTypeError,
  InvalidIndexTypeError,
  InvalidIndexReferenceError,
  IncorrectStreamTypeError,
  InvalidStreamTypeError
} from '@ez4/database/library';

import { getReflection } from '@ez4/project/library';
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

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['engine', 'tables']);
  });

  it('assert :: incomplete table', () => {
    const errors = parseFile('incomplete-table');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteTableError);
    deepEqual(error1.properties, ['name', 'schema', 'indexes']);
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

  it('assert :: incorrect table indexes', () => {
    const errors = parseFile('incorrect-indexes');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncorrectIndexesTypeError);
    equal(error1.baseType, 'Database.Indexes');
    equal(error1.schemaType, 'TestIndexes');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['indexes']);
  });

  it('assert :: invalid table indexes', () => {
    const errors = parseFile('invalid-indexes');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof InvalidIndexesTypeError);
    equal(error1.baseType, 'Database.Indexes');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['indexes']);
  });

  it('assert :: invalid index type', () => {
    const errors = parseFile('invalid-index-type');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof InvalidIndexTypeError);
    equal(error1.indexName, 'id');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['indexes']);
  });

  it('assert :: invalid index reference', () => {
    const errors = parseFile('invalid-index-reference');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof InvalidIndexReferenceError);
    equal(error1.indexName, 'id');
  });

  it('assert :: incomplete stream', () => {
    const errors = parseFile('incomplete-stream');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteStreamError);
    deepEqual(error1.properties, ['handler']);
  });

  it('assert :: incorrect stream', () => {
    const errors = parseFile('incorrect-stream');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncorrectStreamTypeError);
    equal(error1.baseType, 'Database.Stream');
    equal(error1.streamType, 'TestStream');
  });

  it('assert :: invalid stream', () => {
    const errors = parseFile('invalid-stream');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof InvalidStreamTypeError);
    equal(error1.baseType, 'Database.Stream');
  });

  it('assert :: incomplete handler', () => {
    const errors = parseFile('incomplete-handler');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['change']);

    ok(error2 instanceof IncompleteStreamError);
    deepEqual(error2.properties, ['handler']);
  });
});
