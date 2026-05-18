import type { SQSClient } from '@aws-sdk/client-sqs';

import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createQueuePoller, stopQueuePoller } from '../src/provider/poller';

type SqsMockCommand = {
  constructor: { name: string };
  input: {
    QueueName?: string;
    QueueUrl?: string;
    ReceiptHandle?: string;
  };
};

class PollerSqsClient {
  deleted: string[] = [];
  receiveCount = 0;

  constructor(
    private readonly body: string,
    private readonly failAfterFirstReceive = false
  ) {}

  async send(command: SqsMockCommand) {
    if (command.constructor.name === 'ReceiveMessageCommand') {
      this.receiveCount += 1;

      if (this.receiveCount > 1 || this.failAfterFirstReceive) {
        return { Messages: [] };
      }

      return {
        Messages: [
          {
            Body: this.body,
            ReceiptHandle: 'receipt-1',
            MessageAttributes: {
              'EZ4.TRACE_ID': { StringValue: 'trace-1' }
            }
          }
        ]
      };
    }

    if (command.constructor.name === 'DeleteMessageCommand') {
      this.deleted.push(command.input.ReceiptHandle!);
      return {};
    }

    return {};
  }
}

describe('elasticmq poller', () => {
  it('assert :: deletes message after successful dispatch', async () => {
    const client = new PollerSqsClient(JSON.stringify({ foo: 'bar' }));
    const received: unknown[] = [];

    const poller = createQueuePoller({
      key: 'queue-a',
      client: client as unknown as SQSClient,
      queueUrl: 'http://localhost:9324/queue-a',
      waitTime: 0,
      maxMessages: 1,
      dispatch: async (message) => {
        received.push(message);
      }
    });

    await poller.once();

    deepEqual(received, [{ foo: 'bar' }]);
    deepEqual(client.deleted, ['receipt-1']);
  });

  it('assert :: keeps message after failed dispatch', async () => {
    const client = new PollerSqsClient(JSON.stringify({ foo: 'bar' }));
    const poller = createQueuePoller({
      key: 'queue-b',
      client: client as unknown as SQSClient,
      queueUrl: 'http://localhost:9324/queue-b',
      waitTime: 0,
      maxMessages: 1,
      dispatch: async () => {
        throw new Error('handler failed');
      }
    });

    await poller.once();

    deepEqual(client.deleted, []);
  });

  it('assert :: stops registered poller', async () => {
    const stopped = stopQueuePoller('missing-queue');

    equal(stopped, false);
  });

  it('assert :: start and stop poller cycle', async () => {
    const client = new PollerSqsClient(JSON.stringify({ foo: 'bar' }));
    const received: unknown[] = [];

    const poller = createQueuePoller({
      key: 'cycle-queue',
      client: client as unknown as SQSClient,
      queueUrl: 'http://localhost:9324/cycle-queue',
      waitTime: 0,
      maxMessages: 1,
      dispatch: async (message) => {
        received.push(message);
      }
    });

    poller.start();

    await new Promise((resolve) => setTimeout(resolve, 50));

    const stopped = stopQueuePoller('cycle-queue');

    equal(stopped, true);
    deepEqual(received, [{ foo: 'bar' }]);
    deepEqual(client.deleted, ['receipt-1']);
  });
});
