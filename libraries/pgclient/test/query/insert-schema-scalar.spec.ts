import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { SqlBuilder } from '@ez4/pgsql';

import { InsertSchemaScalarTests } from '@ez4/tests-database';

import { prepareInsertQuery } from '../../src/queries/insert';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert scalar schema', () => {
  const prepareInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const { queries } = await prepareInsertQuery(builder, 'ez4-test-insert-schema', schema, {}, input);

    return builder.with(queries).build();
  };

  it('assert :: prepare insert schema (scalar boolean column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareBooleanColumn(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("true", "false") VALUES (:0, :1)`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare insert schema (scalar number column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareNumberColumn(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("number") VALUES (:0)`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare insert schema (scalar string column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareStringColumn(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("string") VALUES (:0)`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare insert schema (scalar nullable column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareNullableColumn(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("nullable") VALUES (null)`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (scalar optional column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareOptionalColumn(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" DEFAULT VALUES`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (scalar unexpected column)', async ({ assert }) => {
    const [statement, variables] = await InsertSchemaScalarTests.prepareUnexpectedColumn(prepareInsert);

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("foo") VALUES (:0)`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare insert schema (scalar undefined column)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaScalarTests.prepareUndefinedColumn(prepareInsert), MalformedRequestError);
  });

  it('assert :: prepare insert schema (invalid scalar field type)', async ({ assert }) => {
    await assert.rejects(() => InsertSchemaScalarTests.prepareInvalidColumn(prepareInsert), MalformedRequestError);
  });
});
