import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { SqlBuilder } from '@ez4/pgsql';

import { UpdateSchemaJsonTests } from '@ez4/tests-database';

import { prepareUpdateQuery } from '../../src/queries/update';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update json schema', () => {
  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const { queries } = await prepareUpdateQuery(builder, 'ez4-test-update-schema', schema, {}, input);

    return builder.with(queries).build();
  };

  it('assert :: prepare update schema (json boolean field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareBooleanField(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['true'] = :0, "json"['false'] = :1`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare update schema (json number field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareNumberField(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['number'] = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json string field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareStringField(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['string'] = :0`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare update schema (json nullable field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareNullableField(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['nullable'] = :0`);

    assert.deepEqual(variables, [null]);
  });

  it('assert :: prepare update schema (json optional field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareOptionalField(prepareUpdate);

    assert.equal(statement, `SELECT FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json undefined fields)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUndefinedField(prepareUpdate);

    assert.equal(statement, `SELECT FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json nullable column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareNullableColumn(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json optional column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareOptionalColumn(prepareUpdate);

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('optional', :0)`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json additional string property)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareAdditionalStringProperty(prepareUpdate);

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('foo', :0, 'bar', :1)`
    );

    assert.deepEqual(variables, [123, 456]);
  });

  it('assert :: prepare update schema (json additional number property)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareAdditionalNumberProperty(prepareUpdate);

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('123', :0, '456', :1)`
    );

    assert.deepEqual(variables, ['foo', 'bar']);
  });

  it('assert :: prepare update schema (json additional nullish field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareAdditionalNullishField(prepareUpdate);

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('foo', :0, 'bar', :1)`
    );

    assert.deepEqual(variables, [123, 456]);
  });

  it('assert :: prepare update schema (json unknown field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUnknownField(prepareUpdate);

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" ` +
        `SET "json" = COALESCE("json", '{}'::jsonb) || ` +
        `jsonb_build_object('foo', :0, 'bar', :1, 'baz', :2, 'qux', COALESCE("json"['qux'], '{}'::jsonb) || jsonb_build_object('inner', :3))`
    );

    assert.deepEqual(variables, [123, 'bar', true, 'abc']);
  });

  it('assert :: prepare update schema (json unknown nullish field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUnknownNullishField(prepareUpdate);

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" ` +
        `SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('foo', :0, 'bar', :1, 'baz', :2, 'qux', :3)`
    );

    assert.deepEqual(variables, [123, 'bar', true, null]);
  });

  it('assert :: prepare update schema (json unexpected field)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaJsonTests.prepareUnexpectedField(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json union field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await UpdateSchemaJsonTests.prepareUnionField(prepareUpdate);

    assert.equal(statementA, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0`);
    assert.equal(statementB, `UPDATE ONLY "ez4-test-update-schema" SET "json"['baz'] = :0`);

    assert.deepEqual(variablesA, [123]);
    assert.deepEqual(variablesB, ['abc']);
  });

  it('assert :: prepare update schema (json union with dynamic field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await UpdateSchemaJsonTests.prepareUnionDynamicField(prepareUpdate);

    assert.equal(statementA, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0`);
    assert.equal(statementB, `UPDATE ONLY "ez4-test-update-schema" SET "json"['baz'] = :0`);

    assert.deepEqual(variablesA, [123]);
    assert.deepEqual(variablesB, ['abc']);
  });

  it('assert :: prepare update schema (json invalid field type)', async ({ assert }) => {
    await assert.rejects(() => UpdateSchemaJsonTests.prepareInvalidField(prepareUpdate), MalformedRequestError);
  });
});
