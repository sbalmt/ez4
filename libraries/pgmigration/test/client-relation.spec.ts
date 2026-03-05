import type { PgTableRepository } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { constraintExists, tableExists } from './common/queries';
import { runMigration } from './common/migration';

describe('migration :: client relation tests', async () => {
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
    table_a: {
      name: 'table_a',
      relations: {},
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          table_b_id: {
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
    },
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

  const repositoryV2: PgTableRepository = {
    table_b: repositoryV1.table_b,
    table_a: {
      ...repositoryV1.table_a,
      relations: {
        table_b_id: {
          sourceTable: 'table_b',
          sourceColumn: 'id',
          sourceIndex: Index.Primary,
          targetColumn: 'table_b_id'
        }
      }
    }
  };

  const repositoryV3: PgTableRepository = {
    renamed_table_b: {
      ...repositoryV1.table_b,
      name: 'renamed_table_b'
    },
    table_a: {
      ...repositoryV1.table_a,
      relations: {
        table_b_id: {
          sourceTable: 'renamed_table_b',
          sourceColumn: 'id',
          sourceIndex: Index.Primary,
          targetColumn: 'table_b_id'
        }
      }
    }
  };

  const repositoryV4: PgTableRepository = {
    renamed_table_b: repositoryV3.renamed_table_b,
    table_a: {
      ...repositoryV3.table_a,
      relations: {}
    }
  };

  it('assert :: create tables', async () => {
    const queries = getCreateQueries(repositoryV1);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk'),
      constraintExists(client, 'table_a_table_b_id_fk')
    ]);

    deepEqual(result, [[{ table_a: true }], [{ table_b: true }], [{ table_a_id_pk: true }], [{ table_b_id_pk: true }], []]);
  });

  it('assert :: create relation', async () => {
    const queries = getUpdateQueries(repositoryV2, repositoryV1);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk'),
      constraintExists(client, 'table_a_table_b_id_fk')
    ]);

    deepEqual(result, [
      [{ table_a: true }],
      [{ table_b: true }],
      [{ table_a_id_pk: true }],
      [{ table_b_id_pk: true }],
      [{ table_a_table_b_id_fk: true }]
    ]);
  });

  it('assert :: rename tables', async () => {
    const queries = getUpdateQueries(repositoryV3, repositoryV2);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'renamed_table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'renamed_table_b_id_pk'),
      constraintExists(client, 'table_a_table_b_id_fk')
    ]);

    deepEqual(result, [
      [{ table_a: true }],
      [{ renamed_table_b: true }],
      [{ table_a_id_pk: true }],
      [{ renamed_table_b_id_pk: true }],
      [{ table_a_table_b_id_fk: true }]
    ]);
  });

  it('assert :: delete relation', async () => {
    const queries = getUpdateQueries(repositoryV4, repositoryV3);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'renamed_table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'renamed_table_b_id_pk'),
      constraintExists(client, 'table_a_table_b_id_fk')
    ]);

    deepEqual(result, [[{ table_a: true }], [{ renamed_table_b: true }], [{ table_a_id_pk: true }], [{ renamed_table_b_id_pk: true }], []]);
  });

  it('assert :: delete tables', async () => {
    const queries = getDeleteQueries(repositoryV4);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'renamed_table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'renamed_table_b_id_pk'),
      constraintExists(client, 'table_a_table_b_id_fk')
    ]);

    deepEqual(result, [[], [], [], [], []]);
  });
});
