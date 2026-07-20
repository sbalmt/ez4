import type { Database, Index, Client as DbClient } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { createTable, isTableState, AttributeType, AttributeKeyType, registerTriggers } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { getRandomUUID } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

declare class TestSchema implements Database.Schema {
  id: string;
  integer: number;
  decimal: number;
}

declare class TestDatabase extends Database.Service<DynamoDbEngine> {
  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}

describe('dynamodb client (atomic number operation)', { timeout: 60000 }, () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<TestDatabase> | undefined;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-atomic-number-operation';

  const id = getRandomUUID();

  registerTriggers();

  beforeEach(async () => {
    await dbClient?.testTable.insertOne({
      data: {
        integer: 2,
        decimal: 2,
        id
      }
    });
  });

  afterEach(async () => {
    await dbClient?.testTable.deleteOne({
      where: {
        id
      }
    });
  });

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTable(localState, {
      tableName,
      allowDeletion: true,
      attributeSchema: [
        [
          {
            attributeName: 'id',
            attributeType: AttributeType.String,
            keyType: AttributeKeyType.Hash
          }
        ]
      ]
    });

    tableId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[tableId];

    ok(resultResource && isTableState(resultResource));
    ok(resultResource.result);

    lastState = result;

    dbClient = Client.make<TestDatabase>({
      repository: {
        testTable: {
          name: tableName,
          indexes: [['id']],
          schema: {
            type: SchemaType.Object,
            properties: {
              id: {
                type: SchemaType.String
              },
              integer: {
                type: SchemaType.Number,
                format: 'integer'
              },
              decimal: {
                type: SchemaType.Number,
                format: 'decimal'
              }
            }
          }
        }
      }
    });

    ok(dbClient);
  });

  it('assert :: increment number', async () => {
    ok(dbClient);

    await dbClient.testTable.updateOne({
      data: {
        integer: {
          increment: 15
        },
        decimal: {
          increment: 5
        }
      },
      where: {
        id
      }
    });

    const result = await dbClient.testTable.findOne({
      select: {
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      integer: 17,
      decimal: 7
    });
  });

  it('assert :: decrement number', async () => {
    ok(dbClient);

    await dbClient.testTable.updateOne({
      data: {
        integer: {
          decrement: 1
        },
        decimal: {
          decrement: 5.5
        }
      },
      where: {
        id
      }
    });

    const result = await dbClient.testTable.findOne({
      select: {
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      integer: 1,
      decimal: -3.5
    });
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);

    dbClient = undefined;
  });
});
