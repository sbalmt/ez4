import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createQueue, isQueue } from '@ez4/aws-queue';
import { deploy } from '@ez4/aws-common';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isQueue(resource));

  const { queueUrl } = resource.result;

  ok(queueUrl);

  return {
    result: resource.result,
    state
  };
};

describe.only('queue', () => {
  let lastState: EntryStates | undefined;
  let queueId: string | undefined;

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createQueue(localState, {
      queueName: 'ez4-test-queue',
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    queueId = resource.entryId;

    const { state } = await assertDeploy(queueId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(queueId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[queueId];

    ok(resource && isQueue(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(queueId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(queueId && lastState);

    ok(lastState[queueId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[queueId], undefined);
  });
});
