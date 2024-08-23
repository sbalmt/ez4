import type { Table } from '@ez4/database';
import type { EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal, deepEqual } from 'node:assert/strict';

import { SchemaTypeName } from '@ez4/schema';
import { createTable, isTable, AttributeType, AttributeKeyType } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { deploy } from '@ez4/aws-common';

type TestSchema = {
  id: string;
  order: number;
  value: string;
};

describe.only('dynamodb client', () => {
  let lastState: EntryStates | undefined;
  let tableId: string | undefined;
  let dbTable: Table<TestSchema>;

  const tableName = 'ez4-test-table-client';

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

    ok(resultResource && isTable(resultResource));
    ok(resultResource.result);

    lastState = result;

    const client = Client.make({
      testTable: {
        tableName,
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

    dbTable = (client as any).testTable;

    ok(dbTable);
  });

  it('assert :: insert item', async () => {
    ok(dbTable);

    await dbTable.insertOne({
      data: {
        id: 'id1',
        value: 'initial test value',
        order: 100
      }
    });
  });

  it('assert :: select item', async () => {
    ok(dbTable);

    const result = await dbTable.findMany({
      select: {
        id: true,
        order: true,
        value: true
      },
      where: {}
    });

    deepEqual(result, {
      cursor: undefined,
      records: [
        {
          id: 'id1',
          order: 100,
          value: 'initial test value'
        }
      ]
    });
  });

  it('assert :: update item', async () => {
    ok(dbTable);

    const result = await dbTable.updateMany({
      data: {
        value: 'updated test value'
      },
      where: {
        id: 'id1',
        order: 100
      },
      select: {
        value: true
      }
    });

    deepEqual(result, [
      {
        id: 'id1',
        order: 100,
        value: 'initial test value'
      }
    ]);
  });

  it('assert :: delete item', async () => {
    ok(dbTable);

    const result = await dbTable.deleteMany({
      where: {
        id: 'id1',
        order: 100
      },
      select: {
        value: true
      }
    });

    deepEqual(result, [
      {
        id: 'id1',
        order: 100,
        value: 'updated test value'
      }
    ]);
  });

  it('assert :: upsert item', async () => {
    ok(dbTable);

    const query = {
      select: {
        value: true
      },
      where: {
        id: 'id2',
        order: 101
      },
      insert: {
        id: 'id2',
        value: 'initial test value',
        order: 101
      },
      update: {
        value: 'updated test value'
      }
    };

    const insertResult = await dbTable.upsertOne(query);

    equal(insertResult, undefined);

    const updateResult = await dbTable.upsertOne(query);

    deepEqual(updateResult, {
      value: 'initial test value'
    });
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
