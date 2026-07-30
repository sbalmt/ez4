import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/aws-dynamodb/runtime';
import { prepareInsert } from '@ez4/aws-dynamodb/client';

import { InsertSchemaJsonTests } from '@ez4/tests-database';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert json schema', () => {
  const prepareInsertQuery = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    return prepareInsert<TestTableMetadata, {}>('ez4-test-insert', schema, [], input);
  };

  it('assert :: prepare insert schema (json boolean field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareBooleanField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ true: true, false: false }]);
  });

  it('assert :: prepare insert schema (json number field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareNumberField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ number: 123 }]);
  });

  it('assert :: prepare insert schema (json string field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareStringField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ string: 'foo' }]);
  });

  it('assert :: prepare insert schema (json nullable field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareNullableField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ nullable: null }]);
  });

  it('assert :: prepare insert schema (json optional field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareOptionalField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{}]);
  });

  it('assert :: prepare insert schema (json nullable column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareNullableColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': null }`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (json optional column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareOptionalColumn(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ optional: 123 }]);
  });

  it('assert :: prepare insert schema (json additional string property)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareAdditionalStringProperty(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ bar: 456, foo: 123 }]);
  });

  it('assert :: prepare insert schema (json additional number property)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareAdditionalNumberProperty(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ 123: 'foo', 456: 'bar' }]);
  });

  it('assert :: prepare insert schema (json additional nullish field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareAdditionalNullishField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ bar: 456, foo: 123 }]);
  });

  it('assert :: prepare insert schema (json unknown field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareUnknownField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ bar: 'bar', baz: true, foo: 123, qux: { inner: 'abc' } }]);
  });

  it('assert :: prepare insert schema (json unknown nullish field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareUnknownNullishField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ bar: 'bar', baz: true, foo: 123, qux: null }]);
  });

  it('assert :: prepare insert schema (json unexpected field)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaJsonTests.prepareUnexpectedField(prepareInsertQuery);

    assert.equal(statement, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variables, [{ foo: 123 }]);
  });

  it('assert :: prepare insert schema (json union field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await InsertSchemaJsonTests.prepareUnionField(prepareInsertQuery);

    assert.equal(statementA, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);
    assert.equal(statementB, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variablesA, [{ foo: 123 }]);
    assert.deepEqual(variablesB, [{ baz: 'abc' }]);
  });

  it('assert :: prepare insert schema (json union with dynamic field)', async ({ assert }) => {
    const [[statementA, variablesA], [statementB, variablesB]] = await InsertSchemaJsonTests.prepareUnionDynamicField(prepareInsertQuery);

    assert.equal(statementA, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);
    assert.equal(statementB, `INSERT INTO "ez4-test-insert" value { 'json': ? }`);

    assert.deepEqual(variablesA, [{ foo: 123 }]);
    assert.deepEqual(variablesB, [{ baz: 'abc' }]);
  });

  it('assert :: prepare insert schema (json undefined field)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaJsonTests.prepareUndefinedField(prepareInsertQuery), MalformedRequestError);
  });

  it('assert :: prepare insert schema (json invalid field type)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaJsonTests.prepareInvalidField(prepareInsertQuery), MalformedRequestError);
  });
});
