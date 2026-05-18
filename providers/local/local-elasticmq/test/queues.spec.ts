import type { SQSClient } from '@aws-sdk/client-sqs';
import type { QueueService } from '@ez4/queue/library';
import type { ServeOptions } from '@ez4/project/library';

import { SchemaType } from '@ez4/schema';
import { deepEqual, equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ensureQueueTopology, getQueueName, getDeadLetterQueueName, purgeQueueTopology } from '../src/provider/queues';

type SqsCommand = {
  constructor: {
    name: string;
  };
  input: {
    QueueName?: string;
    QueueUrl?: string;
    Attributes?: Record<string, string>;
    [key: string]: unknown;
  };
};

class RecordingSqsClient {
  commands: SqsCommand[] = [];

  async send(command: SqsCommand) {
    this.commands.push(command);

    if (command.constructor.name === 'CreateQueueCommand') {
      return { QueueUrl: `http://localhost:9324/${command.input.QueueName}` };
    }

    if (command.constructor.name === 'GetQueueUrlCommand') {
      return { QueueUrl: `http://localhost:9324/${command.input.QueueName}` };
    }

    if (command.constructor.name === 'GetQueueAttributesCommand') {
      return {
        Attributes: {
          QueueArn: `arn:aws:sqs:elasticmq:000000000000:${command.input.QueueUrl!.split('/').at(-1)}`
        }
      };
    }

    if (command.constructor.name === 'PurgeQueueCommand') {
      return {};
    }

    return {};
  }
}

const getBaseOptions = (overrides?: Partial<ServeOptions>): ServeOptions => {
  return {
    prefix: 'ez4',
    projectName: 'test',
    branchName: '',
    localOptions: {},
    testOptions: {},
    serviceHost: 'localhost',
    version: 1,
    ...overrides
  };
};

const getQueueService = (overrides?: Partial<QueueService>): QueueService => {
  return {
    type: '@ez4/queue',
    name: 'TestQueue',
    schema: { type: SchemaType.Object, properties: {} },
    subscriptions: [],
    services: {},
    variables: {},
    context: {},
    ...overrides
  };
};

describe('elasticmq queue topology', () => {
  it('assert :: resolves standard queue name', () => {
    equal(getQueueName('ez4-test-queue', false), 'ez4-test-queue');
  });

  it('assert :: resolves fifo queue name', () => {
    equal(getQueueName('ez4-test-queue', true), 'ez4-test-queue.fifo');
  });

  it('assert :: resolves dead letter queue name', () => {
    equal(getDeadLetterQueueName('ez4-test-queue'), 'ez4-test-queue-dlq');
  });

  it('assert :: resolves dead letter queue name for fifo', () => {
    equal(getDeadLetterQueueName('ez4-test-queue.fifo'), 'ez4-test-queue-dlq.fifo');
  });

  it('assert :: creates queues without redrive policy', async () => {
    const client = new RecordingSqsClient();

    await ensureQueueTopology(client as unknown as SQSClient, getQueueService(), getBaseOptions());

    const createCommands = client.commands.filter((command) => command.constructor.name === 'CreateQueueCommand');

    equal(createCommands.length, 2);
    equal(createCommands[1]!.input.Attributes?.RedrivePolicy, undefined);
  });

  it('assert :: creates queue with redrive policy', async () => {
    const client = new RecordingSqsClient();

    await ensureQueueTopology(
      client as unknown as SQSClient,
      getQueueService({
        deadLetter: { maxRetries: 5 }
      }),
      getBaseOptions()
    );

    const createCommands = client.commands.filter((command) => command.constructor.name === 'CreateQueueCommand');

    equal(createCommands.length, 2);
    ok(createCommands[1]!.input.Attributes!.RedrivePolicy);
  });

  it('assert :: purges main queue', async () => {
    const client = new RecordingSqsClient();

    await purgeQueueTopology(client as unknown as SQSClient, getQueueService(), getBaseOptions());

    deepEqual(
      client.commands.map((command) => command.constructor.name),
      ['GetQueueUrlCommand', 'PurgeQueueCommand']
    );
  });
});
