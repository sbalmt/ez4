import type { EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal, deepEqual } from 'node:assert/strict';

import { createTable, isTable, AttributeType, AttributeKeyType } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { deploy } from '@ez4/aws-common';

describe.only('dynamodb client', () => {
  let lastState: EntryStates | undefined;
  let tableId: string | undefined;
  let dbClient: any;

  it.only('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTable(localState, {
      tableName: 'ez4-test-table-client',
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

    dbClient = Client.make();

    lastState = result;
  });

  it.only('assert :: insert item', async () => {
    ok(dbClient);

    await dbClient.rawQuery(
      `INSERT INTO "ez4-test-table-client" value { 'id':?, 'order':?, 'value':? }`,
      ['id1', 100, 'initial test value']
    );
  });

  it.only('assert :: select item', async () => {
    ok(dbClient);

    const result = await dbClient.rawQuery(`SELECT * FROM "ez4-test-table-client"`);

    deepEqual(result, [
      {
        id: 'id1',
        order: 100,
        value: 'initial test value'
      }
    ]);
  });

  it.only('assert :: update item', async () => {
    ok(dbClient);

    const result = await dbClient.rawQuery(
      `UPDATE "ez4-test-table-client" SET "value"=? WHERE "id"=? AND "order"=? RETURNING ALL OLD *`,
      ['updated test value', 'id1', 100]
    );

    deepEqual(result, [
      {
        id: 'id1',
        order: 100,
        value: 'initial test value'
      }
    ]);
  });

  it.only('assert :: delete item', async () => {
    ok(dbClient);

    const result = await dbClient.rawQuery(
      `DELETE FROM "ez4-test-table-client" WHERE "id"=? AND "order"=? RETURNING ALL OLD *`,
      ['id1', 100]
    );

    deepEqual(result, [
      {
        id: 'id1',
        order: 100,
        value: 'updated test value'
      }
    ]);
  });

  it.only('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
