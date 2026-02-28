import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getDeleteQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: delete table tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties) => {
    return getTableRepository([
      {
        name: 'table',
        schema: {
          type: SchemaType.Object,
          properties
        },
        indexes: [
          {
            name: 'id',
            type: Index.Primary,
            columns: ['id']
          }
        ]
      }
    ]);
  };

  it('assert :: delete table', async () => {
    const tables = getDatabaseTables({
      id: {
        type: SchemaType.String
      }
    });

    const queries = getDeleteQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query: `DROP TABLE IF EXISTS "table" CASCADE`
        }
      ],
      constraints: [],
      validations: [],
      relations: [],
      indexes: []
    });
  });
});
