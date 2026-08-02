import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { SqlBuilder } from '@ez4/pgsql';

import { InsertSchemaJsonTests } from '@ez4/tests-database';

import { prepareInsertQuery } from '../../src/queries/insert';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert json schema', () => {
  const prepareInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const { queries } = await prepareInsertQuery(builder, 'ez4-test-insert-schema', schema, {}, input);

    return builder.with(queries).build();
  };

  it('assert :: prepare insert schema (json boolean field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareBooleanField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ true: true, false: false }]);
  });

  it('assert :: prepare insert schema (json number field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareNumberField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ number: 123 }]);
  });

  it('assert :: prepare insert schema (json string field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareStringField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ string: 'foo' }]);
  });

  it('assert :: prepare insert schema (json nullable field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareNullableField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ nullable: null }]);
  });

  it('assert :: prepare insert schema (json optional field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareOptionalField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{}]);
  });

  it('assert :: prepare insert schema (json additional string property)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareAdditionalStringProperty(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ foo: 123, bar: 456 }]);
  });

  it('assert :: prepare insert schema (json additional number property)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareAdditionalNumberProperty(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ 123: 'foo', 456: 'bar' }]);
  });

  it('assert :: prepare insert schema (json additional nullish field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareAdditionalNullishField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ foo: 123, bar: 456 }]);
  });

  it('assert :: prepare insert schema (json unknown field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareUnknownField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ bar: 'bar', baz: true, foo: 123, qux: { inner: 'abc' } }]);
  });

  it('assert :: prepare insert schema (json unknown nullish field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareUnknownNullishField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ bar: 'bar', baz: true, foo: 123, qux: null }]);
  });

  it('assert :: prepare insert schema (json unexpected field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareUnexpectedField(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ foo: 123 }]);
  });

  it('assert :: prepare insert schema (json union field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await InsertSchemaJsonTests.prepareUnionField(prepareInsert);

    assert.equal(statementA, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);
    assert.equal(statementB, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variablesA, [{ foo: 123 }]);
    assert.deepEqual(variablesB, [{ baz: 'abc' }]);
  });

  it('assert :: prepare insert schema (json union with dynamic field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await InsertSchemaJsonTests.prepareUnionDynamicField(prepareInsert);

    assert.equal(statementA, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);
    assert.equal(statementB, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variablesA, [{ foo: 123 }]);
    assert.deepEqual(variablesB, [{ baz: 'abc' }]);
  });

  it('assert :: prepare insert schema (json undefined field)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaJsonTests.prepareUndefinedField(prepareInsert), MalformedRequestError);
  });

  it('assert :: prepare insert schema (json invalid field type)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaJsonTests.prepareInvalidField(prepareInsert), MalformedRequestError);
  });
});
