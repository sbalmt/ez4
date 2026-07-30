import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/aws-dynamodb/runtime';
import { prepareUpdate } from '@ez4/aws-dynamodb/client';

import { UpdateSchemaJsonTests } from '@ez4/tests-database';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update json schema', () => {
  const prepareUpdateQuery = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    return prepareUpdate<TestTableMetadata, {}>('ez4-test-update', schema, [], input);
  };

  it('assert :: prepare update schema (json boolean field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareBooleanField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."true" = ? SET "json"."false" = ?`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare update schema (json number field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareNumberField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."number" = ?`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json string field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareStringField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."string" = ?`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare update schema (json nullable field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareNullableField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."nullable" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json optional field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareOptionalField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" REMOVE "__EZ4_NOOP"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json undefined field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUndefinedField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" REMOVE "__EZ4_NOOP"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json nullable column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareNullableColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json optional column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareOptionalColumn(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."optional" = ?`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json additional string property)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareAdditionalStringProperty(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."foo" = ? SET "json"."bar" = ?`);

    assert.deepEqual(variables, [123, 456]);
  });

  it('assert :: prepare update schema (json additional number property)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareAdditionalNumberProperty(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."123" = ? SET "json"."456" = ?`);

    assert.deepEqual(variables, ['foo', 'bar']);
  });

  it('assert :: prepare update schema (json additional nullish field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareAdditionalNullishField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."foo" = ? SET "json"."bar" = ?`);

    assert.deepEqual(variables, [123, 456]);
  });

  it('assert :: prepare update schema (json unknown field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUnknownField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."foo" = ? SET "json"."bar" = ? SET "json"."baz" = ? SET "json"."qux" = ?`);

    assert.deepEqual(variables, [123, 'bar', true, { inner: 'abc' }]);
  });

  it('assert :: prepare update schema (json unknown nullish field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUnknownNullishField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."foo" = ? SET "json"."bar" = ? SET "json"."baz" = ? SET "json"."qux" = ?`);

    assert.deepEqual(variables, [123, 'bar', true, null]);
  });

  it('assert :: prepare update schema (json unexpected field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUnexpectedField(prepareUpdateQuery);

    assert.equal(statement, `UPDATE "ez4-test-update" SET "json"."foo" = ?`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json union field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await UpdateSchemaJsonTests.prepareUnionField(prepareUpdateQuery);

    assert.equal(statementA, `UPDATE "ez4-test-update" SET "json"."foo" = ?`);
    assert.equal(statementB, `UPDATE "ez4-test-update" SET "json"."baz" = ?`);

    assert.deepEqual(variablesA, [123]);
    assert.deepEqual(variablesB, ['abc']);
  });

  it('assert :: prepare update schema (json union with dynamic field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await UpdateSchemaJsonTests.prepareUnionDynamicField(prepareUpdateQuery);

    assert.equal(statementA, `UPDATE "ez4-test-update" SET "json"."foo" = ?`);
    assert.equal(statementB, `UPDATE "ez4-test-update" SET "json"."baz" = ?`);

    assert.deepEqual(variablesA, [123]);
    assert.deepEqual(variablesB, ['abc']);
  });

  it('assert :: prepare update schema (json invalid field type)', async ({ assert }) => {
    await assert.rejects(() => UpdateSchemaJsonTests.prepareInvalidField(prepareUpdateQuery), MalformedRequestError);
  });
});
