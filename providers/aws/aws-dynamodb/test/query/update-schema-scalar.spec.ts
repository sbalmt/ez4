import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/aws-dynamodb/runtime';
import { prepareUpdate } from '@ez4/aws-dynamodb/client';

import { UpdateSchemaScalarTests } from '@ez4/tests-database';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update scalar schema', () => {
  const prepareUpdateQuery = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    return prepareUpdate<TestTableMetadata, {}>('ez4-test-update', schema, [], input);
  };

  it('assert :: prepare update schema (scalar boolean column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareBooleanColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "true" = ? SET "false" = ?`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare update schema (scalar number column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareNumberColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "number" = ?`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (scalar string column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareStringColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "string" = ?`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare update schema (scalar nullable column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareNullableColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "nullable" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar optional column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareOptionalColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" REMOVE "__EZ4_NOOP"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar undefined column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareUndefinedColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" REMOVE "__EZ4_NOOP"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar unexpected column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareUnexpectedColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "foo" = ?`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (scalar invalid column type)', async ({ assert }) => {
    await assert.rejects(() => UpdateSchemaScalarTests.prepareInvalidColumn(prepareUpdateQuery), MalformedRequestError);
  });
});
