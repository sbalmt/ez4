import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { createCluster, createInstance, isInstanceState, registerTriggers } from '@ez4/aws-aurora';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isInstanceState(resource));

  const result = resource.result;

  ok(result.clusterName);
  ok(result.instanceName);
  ok(result.instanceArn);

  return {
    result,
    state
  };
};

describe('aurora instance', () => {
  let lastState: EntryStates | undefined;
  let instanceId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const clusterState = createCluster(localState, {
      clusterName: 'ez4-test-cluster-instance',
      allowDeletion: true
    });

    const resource = createInstance(localState, clusterState, {
      instanceName: 'ez4-test-instance',
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    instanceId = resource.entryId;

    const { state } = await assertDeploy(instanceId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(instanceId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[instanceId];

    ok(resource && isInstanceState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(instanceId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(instanceId && lastState);
    ok(lastState[instanceId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[instanceId], undefined);
  });
});
