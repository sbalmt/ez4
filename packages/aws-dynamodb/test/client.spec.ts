import type { Database, Client as DbClient, Index } from '@ez4/database';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Client } from '@ez4/aws-dynamodb/client';
import { SchemaTypeName } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

import {
  createTable,
  isTableState,
  AttributeType,
  AttributeKeyType,
  registerTriggers
} from '@ez4/aws-dynamodb';

declare class TestSchema implements Database.Schema {
  id: string;
  order: number;
  value: string;
}

declare class Test extends Database.Service<[TestSchema]> {
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

describe.only('dynamodb client', () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<Test>;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client';

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTable(localState, {
      tableName,
      allowDeletion: true,
      attributeSchema: [
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
    });

    tableId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[tableId];

    ok(resultResource && isTableState(resultResource));
    ok(resultResource.result);

    lastState = result;

    dbClient = Client.make({
      testTable: {
        tableName,
        tableIndexes: ['id', 'order'],
        tableSchema: {
          type: SchemaTypeName.Object,
          properties: {
            id: {
              type: SchemaTypeName.String
            },
            order: {
              type: SchemaTypeName.Number
            },
            value: {
              type: SchemaTypeName.String
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

    for (let index = 0; index < 150; index++) {
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

    equal(result.length, 150);
  });

  it('assert :: find many', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findMany({
      select: {
        id: true,
        order: true,
        value: true
      },
      where: {
        order: 1149
      }
    });

    deepEqual(result, {
      cursor: undefined,
      records: [
        {
          id: 'bulk-149',
          order: 1149,
          value: 'updated'
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

    equal(result.length, 150);
  });

  it('assert :: insert one', async () => {
    ok(dbClient);

    await dbClient.testTable.insertOne({
      data: {
        id: 'single',
        order: 0,
        value: 'initial'
      }
    });
  });

  it('assert :: update one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        value: 'updated'
      },
      select: {
        value: true
      },
      where: {
        id: 'single',
        order: 0
      }
    });

    deepEqual(result, {
      id: 'single',
      order: 0,
      value: 'initial'
    });
  });

  it('assert :: find one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        value: true
      },
      where: {
        id: 'single',
        order: 0
      }
    });

    deepEqual(result, {
      value: 'updated'
    });
  });

  it('assert :: upsert one', async () => {
    ok(dbClient);

    const query = {
      select: {
        value: true
      },
      where: {
        id: 'upsert',
        order: 0
      },
      insert: {
        id: 'upsert',
        order: 0,
        value: 'initial'
      },
      update: {
        value: 'updated'
      }
    };

    const insertResult = await dbClient.testTable.upsertOne(query);

    equal(insertResult, undefined);

    const updateResult = await dbClient.testTable.upsertOne(query);

    deepEqual(updateResult, {
      value: 'initial'
    });
  });

  it('assert :: delete one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteOne({
      select: {
        value: true
      },
      where: {
        id: 'upsert',
        order: 0
      }
    });

    deepEqual(result, {
      id: 'upsert',
      order: 0,
      value: 'updated'
    });
  });

  it('assert :: transaction :: insert one', async () => {
    ok(dbClient);

    await dbClient.transaction({
      testTable: {
        ['test-1']: {
          insert: {
            data: {
              id: 'transaction-1',
              order: 1,
              value: 'initial'
            }
          }
        },
        ['test-2']: {
          insert: {
            data: {
              id: 'transaction-2',
              order: 2,
              value: 'initial'
            }
          }
        }
      }
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          startsWith: 'transaction'
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
      testTable: {
        ['test-1']: {
          update: {
            data: {
              value: 'updated'
            },
            where: {
              id: 'transaction-1',
              order: 1
            }
          }
        },
        ['test-2']: {
          update: {
            data: {
              value: 'updated'
            },
            where: {
              id: 'transaction-2',
              order: 2
            }
          }
        }
      }
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          startsWith: 'transaction'
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
      testTable: {
        ['test-1']: {
          delete: {
            where: {
              id: 'transaction-1',
              order: 1
            }
          }
        },
        ['test-2']: {
          delete: {
            where: {
              id: 'transaction-2',
              order: 2
            }
          }
        }
      }
    });

    const result = await dbClient.testTable.findMany({
      select: {
        value: true
      },
      where: {
        id: {
          startsWith: 'transaction'
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
