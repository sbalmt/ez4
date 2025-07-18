import type { Database, Index, Client as DbClient } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTable, isTableState, AttributeType, AttributeKeyType, registerTriggers } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';
import { Order } from '@ez4/database';

declare class TestSchema implements Database.Schema {
  id: string;
  order: number;
  value: string;
}

declare class Test extends Database.Service {
  engine: DynamoDbEngine;

  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {
        'id:order': Index.Primary;
      };
    }
  ];
}

describe('dynamodb client (many operations)', () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<Test>;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-many-operations';

  registerTriggers();

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
          },
          {
            attributeName: 'order',
            attributeType: AttributeType.Number,
            keyType: AttributeKeyType.Range
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

    dbClient = Client.make({
      repository: {
        testTable: {
          name: tableName,
          indexes: [['id', 'order']],
          schema: {
            type: SchemaType.Object,
            properties: {
              id: {
                type: SchemaType.String
              },
              order: {
                type: SchemaType.Number
              },
              value: {
                type: SchemaType.String
              }
            }
          }
        }
      }
    });

    ok(dbClient);
  });

  it('assert :: insert many', async () => {
    ok(dbClient);

    const data: any[] = [];

    for (let index = 0; index < 250; index++) {
      data.push({
        id: `bulk-${index}`,
        value: 'test',
        order: 1000 + index
      });
    }

    await dbClient.testTable.insertMany({
      data
    });
  });

  it('assert :: count many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.count({});

    equal(result, 250);
  });

  it('assert :: count many (filtered)', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.count({
      where: {
        AND: [
          {
            order: {
              gt: 1099
            }
          },
          {
            order: {
              lt: 1150
            }
          }
        ]
      }
    });

    equal(result, 50);
  });

  it('assert :: update many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateMany({
      data: {
        value: 'updated'
      },
      select: {
        value: true
      }
    });

    equal(result.length, 250);
  });

  it('assert :: find many', async () => {
    ok(dbClient);

    const { records } = await dbClient.testTable.findMany({
      select: {
        id: true,
        order: true,
        value: true
      },
      where: {
        order: {
          isIn: [1149, 1139]
        }
      }
    });

    equal(records.length, 2);
  });

  it('assert :: find many (ordered)', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findMany({
      select: {
        id: true
      },
      where: {
        id: {
          isIn: ['bulk-149', 'bulk-139']
        }
      },
      order: {
        id: Order.Desc,
        order: Order.Asc
      }
    });

    deepEqual(result, {
      cursor: undefined,
      records: [
        {
          id: 'bulk-149'
        },
        {
          id: 'bulk-139'
        }
      ]
    });
  });

  it('assert :: delete many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteMany({
      select: {
        value: true
      }
    });

    equal(result.length, 250);
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
