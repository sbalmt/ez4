import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { createCluster, isClusterState, registerTriggers } from '@ez4/aws-aurora';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isClusterState(resource));

  const result = resource.result;

  ok(result.clusterName);
  ok(result.clusterArn);
  ok(result.secretArn);
  ok(result.readerEndpoint);
  ok(result.writerEndpoint);

  return {
    result,
    state
  };
};

describe.only('aurora cluster', () => {
  let lastState: EntryStates | undefined;
  let clusterId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createCluster(localState, {
      clusterName: 'ez4-test-cluster',
      allowDeletion: false,
      enableInsights: true,
      enableHttp: true,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    clusterId = resource.entryId;

    const { state } = await assertDeploy(clusterId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(clusterId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[clusterId];

    ok(resource && isClusterState(resource));

    resource.parameters.allowDeletion = true;
    resource.parameters.enableInsights = false;
    resource.parameters.enableHttp = false;

    const { state } = await assertDeploy(clusterId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(clusterId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[clusterId];

    ok(resource && isClusterState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(clusterId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(clusterId && lastState);
    ok(lastState[clusterId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[clusterId], undefined);
  });
});
