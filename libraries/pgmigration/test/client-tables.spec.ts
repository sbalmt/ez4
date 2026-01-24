import type { PgTableRepository } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { constraintExists, tableExists } from './common/queries';
import { runMigration } from './common/migration';

describe('migration :: client tables tests', async () => {
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
    ...repositoryV1,
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

  const repositoryV3: PgTableRepository = {
    renamed_table_a: {
      ...repositoryV2.table_a,
      name: 'renamed_table_a'
    },
    table_b_renamed: {
      ...repositoryV2.table_b,
      name: 'table_b_renamed'
    }
  };

  const repositoryV4: PgTableRepository = {
    ...repositoryV3,
    extra_table_c: {
      name: 'extra_table_c',
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
    const queries = getCreateQueries(repositoryV1);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk')
    ]);

    deepEqual(result, [[{ table_a: true }], [], [{ table_a_id_pk: true }], []]);
  });

  it('assert :: update tables', async () => {
    const queries = getUpdateQueries(repositoryV2, repositoryV1);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk')
    ]);

    deepEqual(result, [[{ table_a: true }], [{ table_b: true }], [{ table_a_id_pk: true }], [{ table_b_id_pk: true }]]);
  });

  it('assert :: rename tables', async () => {
    const queries = getUpdateQueries(repositoryV3, repositoryV2);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'table_a'),
      tableExists(client, 'table_b'),
      constraintExists(client, 'table_a_id_pk'),
      constraintExists(client, 'table_b_id_pk'),
      tableExists(client, 'renamed_table_a'),
      tableExists(client, 'table_b_renamed'),
      constraintExists(client, 'renamed_table_a_id_pk'),
      constraintExists(client, 'table_b_renamed_id_pk')
    ]);

    deepEqual(result, [
      [],
      [],
      [],
      [],
      [{ renamed_table_a: true }],
      [{ table_b_renamed: true }],
      [{ renamed_table_a_id_pk: true }],
      [{ table_b_renamed_id_pk: true }]
    ]);
  });

  it('assert :: extra tables', async () => {
    const queries = getUpdateQueries(repositoryV4, repositoryV3);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'renamed_table_a'),
      tableExists(client, 'table_b_renamed'),
      tableExists(client, 'extra_table_c'),
      constraintExists(client, 'renamed_table_a_id_pk'),
      constraintExists(client, 'table_b_renamed_id_pk'),
      constraintExists(client, 'extra_table_c_id_pk')
    ]);

    deepEqual(result, [
      [{ renamed_table_a: true }],
      [{ table_b_renamed: true }],
      [{ extra_table_c: true }],
      [{ renamed_table_a_id_pk: true }],
      [{ table_b_renamed_id_pk: true }],
      [{ extra_table_c_id_pk: true }]
    ]);
  });

  it('assert :: delete tables', async () => {
    const queries = getDeleteQueries(repositoryV4);

    await runMigration(client, queries);

    const result = await Promise.all([
      tableExists(client, 'renamed_table_a'),
      tableExists(client, 'table_b_renamed'),
      tableExists(client, 'extra_table_c'),
      constraintExists(client, 'renamed_table_a_id_pk'),
      constraintExists(client, 'table_b_renamed_id_pk'),
      constraintExists(client, 'extra_table_c_id_pk')
    ]);

    deepEqual(result, [[], [], [], [], [], []]);
  });
});
