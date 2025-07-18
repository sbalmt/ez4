import type { Database, Index, Client as DbClient } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTable, isTableState, AttributeType, AttributeKeyType, registerTriggers } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

declare class TestSchema implements Database.Schema {
  id: string;
  value: string;
}

declare class Test extends Database.Service {
  engine: DynamoDbEngine;

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

describe('dynamodb client (transaction)', () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<Test>;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-transaction';

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
          indexes: [['id']],
          schema: {
            type: SchemaType.Object,
            properties: {
              id: {
                type: SchemaType.String
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

  it('assert :: transaction :: insert one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: [
        {
          insert: {
            data: {
              id: 'foo',
              value: 'initial'
            }
          }
        },
        {
          insert: {
            data: {
              id: 'bar',
              value: 'initial'
            }
          }
        }
      ]
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          isIn: ['foo', 'bar']
        }
      }
    });

    deepEqual(result.records, [
      {
        value: 'initial'
      },
      {
        value: 'initial'
      }
    ]);
  });

  it('assert :: transaction :: update one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: [
        {
          update: {
            data: {
              value: 'updated'
            },
            where: {
              id: 'foo'
            }
          }
        },
        {
          update: {
            data: {
              value: 'updated'
            },
            where: {
              id: 'bar'
            }
          }
        }
      ]
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          isIn: ['foo', 'bar']
        }
      }
    });

    deepEqual(result.records, [
      {
        value: 'updated'
      },
      {
        value: 'updated'
      }
    ]);
  });

  it('assert :: transaction :: delete one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: [
        {
          delete: {
            where: {
              id: 'foo'
            }
          }
        },
        {
          delete: {
            where: {
              id: 'bar'
            }
          }
        }
      ]
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          isIn: ['foo', 'bar']
        }
      }
    });

    deepEqual(result.records, []);
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
