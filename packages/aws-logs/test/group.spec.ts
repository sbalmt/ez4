import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createLogGroup, isLogGroupState, registerTriggers } from '@ez4/aws-logs';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isLogGroupState(resource));

  const { groupArn } = resource.result;

  ok(groupArn);

  return {
    result: resource.result,
    state
  };
};

describe('group', () => {
  let lastState: EntryStates | undefined;
  let groupId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createLogGroup(localState, {
      groupName: 'ez4-test-log-group',
      retention: 7,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    groupId = resource.entryId;

    const { state } = await assertDeploy(groupId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(groupId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[groupId];

    ok(resource && isLogGroupState(resource));

    resource.parameters.retention = undefined;

    const { state } = await assertDeploy(groupId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(groupId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[groupId];

    ok(resource && isLogGroupState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(groupId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(groupId && lastState);

    ok(lastState[groupId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[groupId], undefined);
  });
});
