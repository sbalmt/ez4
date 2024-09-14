import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createBucket, isBucket, registerTriggers } from '@ez4/aws-bucket';
import { deploy } from '@ez4/aws-common';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isBucket(resource));

  const { bucketName, location } = resource.result;

  ok(bucketName);
  ok(location);

  return {
    result: resource.result,
    state
  };
};

describe.only('bucket resources', () => {
  let lastState: EntryStates | undefined;
  let bucketId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createBucket(localState, {
      bucketName: 'ez4-test-bucket',
      autoExpireDays: 5,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    bucketId = resource.entryId;

    const { state } = await assertDeploy(bucketId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(bucketId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[bucketId];

    ok(resource && isBucket(resource));

    resource.parameters.autoExpireDays = undefined;

    const { state } = await assertDeploy(bucketId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(bucketId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[bucketId];

    ok(resource && isBucket(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(bucketId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(bucketId && lastState);

    ok(lastState[bucketId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[bucketId], undefined);
  });
});
