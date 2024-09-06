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

    dbTable = (client as any).testTable;

    ok(dbTable);
  });

  it('assert :: insert many', async () => {
    ok(dbTable);

    const data: any[] = [];

    for (let index = 0; index < 150; index++) {
      data.push({
        id: `bulk-${index}`,
        value: 'test',
        order: 1000 + index
      });
    }

    await dbTable.insertMany({
      data
    });
  });

  it('assert :: update many', async () => {
    ok(dbTable);

    const result = await dbTable.updateMany({
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
    ok(dbTable);

    const result = await dbTable.findMany({
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
    ok(dbTable);

    const result = await dbTable.deleteMany({
      select: {
        value: true
      }
    });

    equal(result.length, 150);
  });

  it('assert :: insert one', async () => {
    ok(dbTable);

    await dbTable.insertOne({
      data: {
        id: 'single',
        order: 0,
        value: 'initial'
      }
    });
  });

  it('assert :: update one', async () => {
    ok(dbTable);

    const result = await dbTable.updateOne({
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
    ok(dbTable);

    const result = await dbTable.findOne({
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
    ok(dbTable);

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

    const insertResult = await dbTable.upsertOne(query);

    equal(insertResult, undefined);

    const updateResult = await dbTable.upsertOne(query);

    deepEqual(updateResult, {
      value: 'initial'
    });
  });

  it('assert :: delete one', async () => {
    ok(dbTable);

    const result = await dbTable.deleteOne({
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

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
