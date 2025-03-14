import type { ObjectSchema } from '@ez4/schema';

import { describe, it, mock } from 'node:test';
import { deepEqual, equal } from 'node:assert';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

describe('sql builder tests', () => {
  it('assert :: on prepare variable (insert)', async () => {
    const onPrepareVariable = mock.fn((value, { index }) => `insert_${index}_${value}`);

    const sql = new SqlBuilder({
      onPrepareVariable
    });

    const [, variables] = sql.insert().into('table').record({ foo: 'bar' }).build();

    equal(onPrepareVariable.mock.callCount(), 1);

    deepEqual(variables, ['insert_0_bar']);
  });

  it('assert :: on prepare variable (insert with schema)', async () => {
    const onPrepareVariable = mock.fn((value, { index, schema }) => {
      if (!schema) {
        throw new Error(`Missing INSERT schema.`);
      }

      return `insert_${index}_${value}`;
    });

    const sql = new SqlBuilder({
      onPrepareVariable
    });

    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.String
        }
      }
    };

    const [, variables] = sql.insert(schema).into('table').record({ foo: 'bar' }).build();

    equal(onPrepareVariable.mock.callCount(), 1);

    deepEqual(variables, ['insert_0_bar']);
  });

  it('assert :: on prepare variable (update)', async () => {
    const onPrepareVariable = mock.fn((value, { index }) => `update_${index}_${value}`);

    const sql = new SqlBuilder({
      onPrepareVariable
    });

    const [, variables] = sql.update().only('table').record({ foo: 'bar' }).build();

    equal(onPrepareVariable.mock.callCount(), 1);

    deepEqual(variables, ['update_0_bar']);
  });

  it('assert :: on prepare variable (update with schema)', async () => {
    const onPrepareVariable = mock.fn((value, { index, schema }) => {
      if (!schema) {
        throw new Error(`Missing UPDATE schema.`);
      }

      return `update_${index}_${value}`;
    });

    const sql = new SqlBuilder({
      onPrepareVariable
    });

    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          properties: {
            bar: {
              type: SchemaType.String
            }
          }
        }
      }
    };

    const [, variables] = sql
      .update(schema)
      .only('table')
      .record({ foo: { bar: 'baz' } })
      .build();

    equal(onPrepareVariable.mock.callCount(), 1);

    deepEqual(variables, ['update_0_baz']);
  });

  it('assert :: on prepare variable (where)', async () => {
    const onPrepareVariable = mock.fn((value, { index }) => `where_${index}_${value}`);

    const sql = new SqlBuilder({
      onPrepareVariable
    });

    const [, variables] = sql.select().from('table').where({ foo: 'bar' }).build();

    equal(onPrepareVariable.mock.callCount(), 1);

    deepEqual(variables, ['where_0_bar']);
  });
});
