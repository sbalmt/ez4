import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update json column tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties) => {
    return getTableRepository([
      {
        name: 'table',
        schema: {
          type: SchemaType.Object,
          properties: {
            parent_id: {
              type: SchemaType.String
            },
            json: {
              type: SchemaType.Object,
              properties
            }
          }
        },
        indexes: [
          {
            name: 'parent_id',
            type: Index.Secondary,
            columns: ['parent_id']
          }
        ],
        relations: [
          {
            sourceTable: 'parent',
            sourceColumn: 'id',
            sourceIndex: Index.Primary,
            targetAlias: 'parent',
            targetColumn: 'parent_id',
            targetIndex: Index.Secondary
          }
        ]
      },
      {
        name: 'parent',
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String
            }
          }
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

  it('assert :: alter table (change json column properties with foreign key)', () => {
    const sourceTable = getDatabaseTables({
      changed: {
        type: SchemaType.String
      },
      removed: {
        type: SchemaType.Boolean
      }
    });

    const targetTable = getDatabaseTables({
      changed: {
        type: SchemaType.Number
      },
      added: {
        type: SchemaType.Boolean
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });
});
