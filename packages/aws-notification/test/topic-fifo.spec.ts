import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createTopic, isTopicState, registerTriggers } from '@ez4/aws-notification';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isTopicState(resource));

  const { topicArn } = resource.result;

  ok(topicArn);

  return {
    result: resource.result,
    state
  };
};

describe('notification fifo mode topic', () => {
  let lastState: EntryStates | undefined;
  let topicId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTopic(localState, {
      topicName: 'ez4-test-notification-topic',
      fifoMode: true,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    topicId = resource.entryId;

    const { state } = await assertDeploy(topicId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(topicId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[topicId];

    ok(resource && isTopicState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(topicId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(topicId && lastState);

    ok(lastState[topicId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[topicId], undefined);
  });
});
