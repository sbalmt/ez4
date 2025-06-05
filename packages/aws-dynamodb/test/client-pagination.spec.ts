import type { Database, Index, Client as DbClient } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
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

describe.only('dynamodb client (1mb pagination)', () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<Test>;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-pagination';

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
    });

    ok(dbClient);
  });

  it('assert :: insert records', async () => {
    ok(dbClient);

    const data: any[] = [];

    for (let index = 10; index < 99; index++) {
      data.push({
        id: `bulk-${index}`,
        value: `A${index}:`.repeat(4096)
      });
    }

    await dbClient.testTable.insertMany({
      data
    });
  });

  it('assert :: count all (pagination forced)', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.count({});

    equal(result, 89);
  });

  it('assert :: find many (pagination forced)', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findMany({
      select: {
        id: true
      },
      limit: 75
    });

    equal(result.records.length, 75);
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
