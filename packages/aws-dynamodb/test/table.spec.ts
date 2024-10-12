import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import {
  createTable,
  isTableState,
  AttributeType,
  AttributeKeyType,
  registerTriggers
} from '@ez4/aws-dynamodb';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isTableState(resource));

  const result = resource.result;

  ok(result.tableName);
  ok(result.tableArn);

  return {
    result,
    state
  };
};

describe.only('dynamodb table', () => {
  let lastState: EntryStates | undefined;
  let tableId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTable(localState, {
      tableName: 'ez4TestTable2',
      enableStreams: true,
      ttlAttribute: 'ttl',
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
      ],
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    tableId = resource.entryId;

    const { state } = await assertDeploy(tableId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(tableId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[tableId];

    ok(resource && isTableState(resource));

    resource.parameters.allowDeletion = true;
    resource.parameters.enableStreams = false;

    resource.parameters.tags = {
      test2: 'ez4-tag2'
    };

    const { state } = await assertDeploy(tableId, localState, lastState);

    lastState = state;
  });

  it('assert :: update ttl', async () => {
    ok(tableId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[tableId];

    ok(resource && isTableState(resource));

    resource.parameters.ttlAttribute = undefined;

    const { state } = await assertDeploy(tableId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(tableId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[tableId];

    ok(resource && isTableState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(tableId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);
  });
});
