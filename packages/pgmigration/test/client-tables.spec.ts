import type { PgTableRepository } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { constraintExists, tableExists } from './common/queries.js';
import { runMigration } from './common/migration.js';

describe('migration :: client tables tests', async () => {
  const client = await Client.make({
    debug: false,
    repository: {},
    connection: {
      database: 'pg',
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.1'
    }
  });

  const initialRepository: PgTableRepository = {
    table_a: {
      name: 'table_a',
      relations: {},
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          }
        }
      },
      indexes: {
        id: {
          type: Index.Primary,
          columns: ['id'],
          name: 'id'
        }
      }
    }
  };

  const migrationRepository: PgTableRepository = {
    ...initialRepository,
    table_b: {
      name: 'table_b',
      relations: {},
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          }
        }
      },
      indexes: {
        id: {
          type: Index.Primary,
          columns: ['id'],
          name: 'id'
        }
      }
    }
  };

  it('assert :: create tables', async () => {
    const queries = getCreateQueries(initialRepository);

    await runMigration(client, [...queries.tables, ...queries.indexes, ...queries.relations]);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk')
    ]);

    deepEqual(result, [[{ table_a: true }], [], [{ table_a_id_pk: true }], []]);
  });

  it('assert :: update tables', async () => {
    const queries = getUpdateQueries(migrationRepository, initialRepository);

    await runMigration(client, [...queries.tables, ...queries.indexes, ...queries.relations]);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk')
    ]);

    deepEqual(result, [[{ table_a: true }], [{ table_b: true }], [{ table_a_id_pk: true }], [{ table_b_id_pk: true }]]);
  });

  it('assert :: delete tables', async () => {
    const queries = getDeleteQueries(migrationRepository);

    await runMigration(client, [...queries.tables, ...queries.indexes, ...queries.relations]);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk')
    ]);

    deepEqual(result, [[], [], [], []]);
  });
});
