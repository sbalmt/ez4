import type { SQSClient } from '@aws-sdk/client-sqs';
import type { MessageSchema } from '@ez4/queue/utils';

import { SchemaType } from '@ez4/schema';
import { equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createElasticMqQueueClient, getElasticMqClient } from '../src/provider/client';

const messageSchema: MessageSchema = {
  type: SchemaType.Object,
  properties: {}
};

type SendCommandInput = {
  QueueUrl?: string;
  MessageBody?: string;
  MessageGroupId?: string;
  MessageDeduplicationId?: string;
  DelaySeconds?: number;
  MessageAttributes?: Record<string, unknown>;
};

class RecordingSqsClient {
  sentCommands: SendCommandInput[] = [];

  async send(command: { constructor: { name: string }; input: SendCommandInput }) {
    if (command.constructor.name === 'SendMessageCommand') {
      this.sentCommands.push(command.input);
    }

    return {};
  }
}

describe('elasticmq client factory', () => {
  it('assert :: creates sqs sdk client', () => {
    const client = getElasticMqClient('http://localhost:9324');

    ok(client);
  });

  it('assert :: creates queue contract client', () => {
    const client = createElasticMqQueueClient('queue-url', messageSchema, getElasticMqClient('http://localhost:9324'));

    equal(typeof client.sendMessage, 'function');
    equal(typeof client.receiveMessage, 'function');
  });

  it('assert :: sends message with group id', async () => {
    const recording = new RecordingSqsClient();

    const client = createElasticMqQueueClient('test-queue', messageSchema, recording as unknown as SQSClient, {
      fairMode: { groupId: 'foo' }
    });

    await client.sendMessage({ foo: 'group-123' });

    equal(recording.sentCommands.length, 1);
    equal(recording.sentCommands[0]!.QueueUrl, 'test-queue');
    equal(recording.sentCommands[0]!.MessageGroupId, 'group-123');
    ok(recording.sentCommands[0]!.MessageBody);
    ok(recording.sentCommands[0]!.MessageAttributes?.['EZ4.TRACE_ID']);
  });

  it('assert :: sends message with group id and unique id', async () => {
    const recording = new RecordingSqsClient();

    const client = createElasticMqQueueClient('fifo-queue', messageSchema, recording as unknown as SQSClient, {
      fifoMode: { groupId: 'foo', uniqueId: 'bar' }
    });

    await client.sendMessage({ foo: 'group-1', bar: 'dedup-1' });

    equal(recording.sentCommands.length, 1);
    equal(recording.sentCommands[0]!.MessageGroupId, 'group-1');
    equal(recording.sentCommands[0]!.MessageDeduplicationId, 'dedup-1');
  });

  it('assert :: sends message with delay', async () => {
    const recording = new RecordingSqsClient();

    const client = createElasticMqQueueClient('delayed-queue', messageSchema, recording as unknown as SQSClient);

    await client.sendMessage({}, { delay: 10 });

    equal(recording.sentCommands.length, 1);
    equal(recording.sentCommands[0]!.DelaySeconds, 10);
  });
});
