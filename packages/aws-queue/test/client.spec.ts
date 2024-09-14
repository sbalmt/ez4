import type { EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, deepEqual, equal } from 'node:assert/strict';

import { createQueue, isQueue, registerTriggers } from '@ez4/aws-queue';
import { SchemaTypeName } from '@ez4/schema';
import { Client } from '@ez4/aws-queue/client';
import { deploy } from '@ez4/aws-common';

describe.only('queue client', () => {
  let lastState: EntryStates | undefined;
  let queueId: string | undefined;
  let queueClient: ReturnType<typeof Client.make>;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createQueue(localState, {
      queueName: 'ez4-test-queue-client'
    });

    queueId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[queueId];

    ok(resultResource && isQueue(resultResource));
    ok(resultResource.result);

    const { queueUrl } = resultResource.result;

    queueClient = Client.make(queueUrl, {
      type: SchemaTypeName.Object,
      properties: {
        test: {
          type: SchemaTypeName.String
        }
      }
    });

    lastState = result;
  });

  it('assert :: send message', async () => {
    ok(queueClient);

    await queueClient.sendMessage(
      {
        test: 'EZ4 Test Message'
      },
      {
        delay: 5
      }
    );
  });

  it('assert :: receive message', async () => {
    ok(queueClient);

    const messages = await queueClient.receiveMessage({
      maxWait: 10
    });

    equal(messages.length, 1);

    deepEqual(messages[0], {
      test: 'EZ4 Test Message'
    });
  });

  it('assert :: destroy', async () => {
    ok(queueId && lastState);

    ok(lastState[queueId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[queueId], undefined);
  });
});
