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

describe('dynamodb client (one operation)', () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<Test>;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-one-operation';

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

  it('assert :: insert one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.insertOne({
      select: {
        id: true
      },
      data: {
        id: 'foo',
        order: 0,
        value: 'initial'
      }
    });

    deepEqual(result, {
      id: 'foo'
    });
  });

  it('assert :: update one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      data: {
        value: 'updated',
        order: undefined
      },
      select: {
        value: true
      },
      where: {
        id: 'foo',
        order: 0
      }
    });

    deepEqual(result, {
      value: 'initial'
    });
  });

  it('assert :: find one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        value: true,
        order: false
      },
      where: {
        id: 'foo',
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
        id: 'bar',
        order: 0
      },
      insert: {
        id: 'bar',
        order: 0,
        value: 'initial'
      },
      update: {
        value: 'updated'
      }
    };

    // Return the current value
    const insertResult = await dbClient.testTable.upsertOne(query);

    deepEqual(insertResult, {
      value: 'initial'
    });

    // Return the last value
    const update1Result = await dbClient.testTable.upsertOne(query);

    deepEqual(update1Result, {
      value: 'initial'
    });

    // Return the last value
    const update2Result = await dbClient.testTable.upsertOne(query);

    deepEqual(update2Result, {
      value: 'updated'
    });
  });

  it('assert :: delete one', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteOne({
      select: {
        value: true
      },
      where: {
        id: 'foo',
        order: 0
      }
    });

    deepEqual(result, {
      value: 'updated'
    });
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
