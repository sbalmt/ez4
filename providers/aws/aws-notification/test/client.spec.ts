import type { EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createTopic, isTopicState, registerTriggers } from '@ez4/aws-notification';
import { Client } from '@ez4/aws-notification/client';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';

describe('notification client', () => {
  let lastState: EntryStates | undefined;
  let topicId: string | undefined;
  let topicClient: ReturnType<typeof Client.make>;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTopic(localState, {
      topicName: 'ez4-test-notification-topic-client',
      fifoMode: false
    });

    topicId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[topicId];

    ok(resultResource && isTopicState(resultResource));
    ok(resultResource.result);

    const { topicArn } = resultResource.result;

    topicClient = Client.make(topicArn, {
      type: SchemaType.Object,
      properties: {
        test: {
          type: SchemaType.String
        }
      }
    });

    lastState = result;
  });

  it('assert :: send message', async () => {
    ok(topicClient);

    await topicClient.sendMessage({
      test: 'EZ4 Test Message'
    });
  });

  it('assert :: destroy', async () => {
    ok(topicId && lastState);

    ok(lastState[topicId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[topicId], undefined);
  });
});
