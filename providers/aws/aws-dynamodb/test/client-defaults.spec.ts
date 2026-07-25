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
  string?: string;
  integer?: number;
  decimal?: number;
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

describe('dynamodb client defaults', { timeout: 60000 }, () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<TestDatabase> | undefined;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-defaults';

  const id = getRandomUUID();

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
              string: {
                type: SchemaType.String,
                optional: true,
                definitions: {
                  default: 'abc'
                }
              },
              integer: {
                type: SchemaType.Number,
                format: 'integer',
                optional: true,
                definitions: {
                  default: 123
                }
              },
              decimal: {
                type: SchemaType.Number,
                format: 'decimal',
                optional: true,
                definitions: {
                  default: 4.56
                }
              }
            }
          }
        }
      }
    });

    ok(dbClient);
  });

  it('assert :: insert one and select default values', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.insertOne({
      select: {
        string: true,
        integer: true,
        decimal: true
      },
      data: {
        id
      }
    });

    deepEqual(result, {
      string: 'abc',
      integer: 123,
      decimal: 4.56
    });
  });

  it('assert :: upsert one and select default values', async () => {
    ok(dbClient);

    const newId = getRandomUUID();

    const result = await dbClient.testTable.upsertOne({
      select: {
        string: true,
        integer: true,
        decimal: true
      },
      insert: {
        id: newId
      },
      update: {},
      where: {
        id: newId
      }
    });

    deepEqual(result, {
      inserted: true,
      record: {
        string: 'abc',
        integer: 123,
        decimal: 4.56
      }
    });
  });

  it('assert :: find one and get default values', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.findOne({
      select: {
        string: true,
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      string: 'abc',
      integer: 123,
      decimal: 4.56
    });
  });

  it('assert :: find many and get default values', async () => {
    ok(dbClient);

    const { records } = await dbClient.testTable.findMany({
      select: {
        string: true,
        integer: true,
        decimal: true
      }
    });

    deepEqual(records, [
      {
        string: 'abc',
        integer: 123,
        decimal: 4.56
      },
      {
        string: 'abc',
        integer: 123,
        decimal: 4.56
      }
    ]);
  });

  it('assert :: update one and select default values', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateOne({
      select: {
        string: true,
        integer: true,
        decimal: true
      },
      data: {
        string: 'def'
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      string: 'abc',
      integer: 123,
      decimal: 4.56
    });
  });

  it('assert :: update many and select default values', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.updateMany({
      select: {
        string: true,
        integer: true,
        decimal: true
      },
      data: {
        integer: 789
      }
    });

    // It should always keep the order for the comparison.
    result.sort((a, b) => a.string!.localeCompare(b.string!));

    deepEqual(result, [
      {
        string: 'abc',
        integer: 123,
        decimal: 4.56
      },
      {
        string: 'def',
        integer: 123,
        decimal: 4.56
      }
    ]);
  });

  it('assert :: delete one and select default values', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteOne({
      select: {
        string: true,
        integer: true,
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      string: 'def',
      integer: 789,
      decimal: 4.56
    });
  });

  it('assert :: delete many and select default values', async () => {
    ok(dbClient);

    const result = await dbClient.testTable.deleteMany({
      select: {
        string: true,
        integer: true,
        decimal: true
      }
    });

    deepEqual(result, [
      {
        string: 'abc',
        integer: 789,
        decimal: 4.56
      }
    ]);
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);

    dbClient = undefined;
  });
});
