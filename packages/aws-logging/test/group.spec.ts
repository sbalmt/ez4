import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createGroup, isGroupState, registerTriggers } from '@ez4/aws-logging';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isGroupState(resource));

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

    const resource = createGroup(localState, {
      groupName: 'ez4-test-logs',
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    groupId = resource.entryId;

    const { state } = await assertDeploy(groupId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(groupId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[groupId];

    ok(resource && isGroupState(resource));

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
