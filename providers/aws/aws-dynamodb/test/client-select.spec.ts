import type { Database, Index, Client as DbClient } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { EntryStates } from '@ez4/stateful';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTable, isTableState, AttributeType, AttributeKeyType, registerTriggers } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { getRandomUUID } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

declare class TestSchema implements Database.Schema {
  id: string;
  array: {
    foo: string;
    bar: number;
  }[];
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

describe('dynamodb client selects', { timeout: 60000 }, () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<TestDatabase> | undefined;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-selects';

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
              array: {
                type: SchemaType.Array,
                element: {
                  type: SchemaType.Object,
                  properties: {
                    foo: {
                      type: SchemaType.String
                    },
                    bar: {
                      type: SchemaType.Number
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    ok(dbClient);
  });

  it('assert :: insert and select array fields', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.insertOne({
      select: {
        array: {
          bar: true
        }
      },
      data: {
        id: getRandomUUID(),
        array: [
          {
            foo: 'abc',
            bar: 123
          },
          {
            foo: 'def',
            bar: 456
          }
        ]
      }
    });

    deepEqual(result, {
      array: [
        {
          bar: 123
        },
        {
          bar: 456
        }
      ]
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
