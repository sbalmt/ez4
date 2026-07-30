import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/aws-dynamodb/runtime';
import { prepareInsert } from '@ez4/aws-dynamodb/client';

import { InsertSchemaScalarTests } from '@ez4/tests-database';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert scalar schema', () => {
  const prepareInsertQuery = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    return prepareInsert<TestTableMetadata, {}>('ez4-test-insert', schema, [], input);
  };

  it('assert :: prepare insert schema (scalar boolean column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareBooleanColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'true': ?, 'false': ? }`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare insert schema (scalar number column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareNumberColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'number': ? }`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare insert schema (scalar string column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareStringColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'string': ? }`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare insert schema (scalar nullable column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareNullableColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'nullable': null }`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (scalar optional column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareOptionalColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value {  }`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (scalar undefined column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareUndefinedColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value {  }`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (scalar unexpected column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareUnexpectedColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'foo': ? }`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare insert schema (scalar invalid column type)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaScalarTests.prepareInvalidColumn(prepareInsertQuery), MalformedRequestError);
  });
});
