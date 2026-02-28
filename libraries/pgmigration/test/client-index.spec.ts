import type { PgTableRepository } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { constraintExists, indexExists, tableExists } from './common/queries';
import { runMigration } from './common/migration';

describe('migration :: client index tests', async () => {
  const client = Client.make({
    debug: false,
    repository: {},
    connection: {
      database: 'postgres',
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.1'
    }
  });

  const repositoryV1: PgTableRepository = {
    table: {
      name: 'table',
      relations: {},
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          column_a: {
            type: SchemaType.String
          },
          column_b: {
            type: SchemaType.String
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

  const repositoryV2: PgTableRepository = {
    table: {
      ...repositoryV1.table,
      indexes: {
        ...repositoryV1.table.indexes,
        column_a: {
          type: Index.Secondary,
          columns: ['column_a'],
          name: 'column_a'
        }
      }
    }
  };

  const repositoryV3: PgTableRepository = {
    table: {
      ...repositoryV2.table,
      indexes: {
        ...repositoryV2.table.indexes,
        column_b: {
          type: Index.Unique,
          columns: ['column_b'],
          name: 'column_b'
        }
      }
    }
  };

  const repositoryV4: PgTableRepository = {
    renamed_table: {
      ...repositoryV3.table,
      name: 'renamed_table'
    }
  };

  const repositoryV5: PgTableRepository = {
    renamed_table: {
      ...repositoryV4.renamed_table,
      indexes: {
        id: repositoryV4.renamed_table.indexes.id
      }
    }
  };

  it('assert :: create tables', async () => {
    const queries = getCreateQueries(repositoryV1);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table'),
      constraintExists(client, 'table_id_pk'),
      indexExists(client, 'table_column_a_sk'),
      indexExists(client, 'table_column_b_uk')
    ]);

    deepEqual(result, [[{ table: true }], [{ table_id_pk: true }], [], []]);
  });

  it('assert :: create index (secondary)', async () => {
    const queries = getUpdateQueries(repositoryV2, repositoryV1);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table'),
      constraintExists(client, 'table_id_pk'),
      indexExists(client, 'table_column_a_sk'),
      indexExists(client, 'table_column_b_uk')
    ]);

    deepEqual(result, [[{ table: true }], [{ table_id_pk: true }], [{ table_column_a_sk: true }], []]);
  });

  it('assert :: create index (unique)', async () => {
    const queries = getUpdateQueries(repositoryV3, repositoryV2);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table'),
      constraintExists(client, 'table_id_pk'),
      indexExists(client, 'table_column_a_sk'),
      indexExists(client, 'table_column_b_uk')
    ]);

    deepEqual(result, [[{ table: true }], [{ table_id_pk: true }], [{ table_column_a_sk: true }], [{ table_column_b_uk: true }]]);
  });

  it('assert :: rename tables', async () => {
    const queries = getUpdateQueries(repositoryV4, repositoryV3);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'renamed_table'),
      constraintExists(client, 'renamed_table_id_pk'),
      indexExists(client, 'renamed_table_column_a_sk'),
      indexExists(client, 'renamed_table_column_b_uk')
    ]);

    deepEqual(result, [
      [{ renamed_table: true }],
      [{ renamed_table_id_pk: true }],
      [{ renamed_table_column_a_sk: true }],
      [{ renamed_table_column_b_uk: true }]
    ]);
  });

  it('assert :: delete indexes', async () => {
    const queries = getUpdateQueries(repositoryV5, repositoryV4);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'renamed_table'),
      constraintExists(client, 'renamed_table_id_pk'),
      indexExists(client, 'renamed_table_column_a_sk'),
      indexExists(client, 'renamed_table_column_b_uk')
    ]);

    deepEqual(result, [[{ renamed_table: true }], [{ renamed_table_id_pk: true }], [], []]);
  });

  it('assert :: delete tables', async () => {
    const queries = getDeleteQueries(repositoryV5);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'renamed_table'),
      constraintExists(client, 'renamed_table_id_pk'),
      indexExists(client, 'renamed_table_column_a_sk'),
      indexExists(client, 'renamed_table_column_b_uk')
    ]);

    deepEqual(result, [[], [], [], []]);
  });
});
