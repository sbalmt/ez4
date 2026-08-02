import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { SqlBuilder } from '@ez4/pgsql';

import { UpdateSchemaScalarTests } from '@ez4/tests-database';

import { prepareUpdateQuery } from '../../src/queries/update';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update scalar schema', () => {
  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const { queries } = await prepareUpdateQuery(builder, 'ez4-test-update-schema', schema, {}, input);

    return builder.with(queries).build();
  };

  it('assert :: prepare update schema (scalar boolean column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareBooleanColumn(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "true" = :0, "false" = :1`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare update schema (scalar number column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareNumberColumn(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "number" = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (scalar string column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareStringColumn(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "string" = :0`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare update schema (scalar nullable column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareNullableColumn(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "nullable" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar optional column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareOptionalColumn(prepareUpdate);

    assert.equal(statement, `SELECT FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar undefined column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareUndefinedColumn(prepareUpdate);

    assert.equal(statement, `SELECT FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar unexpected column)', async ({ assert }) => {
    const [statement, variables] = await UpdateSchemaScalarTests.prepareUnexpectedColumn(prepareUpdate);

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "foo" = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (scalar invalid column type)', async ({ assert }) => {
    await assert.rejects(() => UpdateSchemaScalarTests.prepareInvalidColumn(prepareUpdate), MalformedRequestError);
  });
});
