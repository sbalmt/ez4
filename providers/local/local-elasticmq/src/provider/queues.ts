import type { QueueService } from '@ez4/queue/library';
import type { ServeOptions } from '@ez4/project/library';

import type { SQSClient } from '@aws-sdk/client-sqs';

import { CreateQueueCommand, GetQueueAttributesCommand, GetQueueUrlCommand, PurgeQueueCommand } from '@aws-sdk/client-sqs';

import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

export const getQueueName = (queueIdentifier: string, isFifo: boolean) => {
  if (isFifo && !queueIdentifier.endsWith('.fifo')) {
    return `${queueIdentifier}.fifo`;
  }

  return queueIdentifier;
};

export const getDeadLetterQueueName = (queueIdentifier: string) => {
  if (queueIdentifier.endsWith('.fifo')) {
    return `${queueIdentifier.slice(0, -5)}-dlq.fifo`;
  }

  return `${queueIdentifier}-dlq`;
};

export const ensureQueueTopology = async (client: SQSClient, service: QueueService, options: ServeOptions) => {
  const isFifo = !!service.fifoMode;
  const identifier = getServiceName(service.name, options);
  const queueName = getQueueName(identifier, isFifo);
  const dlqName = getDeadLetterQueueName(queueName);

  const dlqUrl = await createQueue(client, dlqName, isFifo);
  const dlqArn = await getQueueArn(client, dlqUrl);

  const mainQueueAttributes: Record<string, string> = {};

  if (service.deadLetter) {
    mainQueueAttributes.RedrivePolicy = JSON.stringify({
      deadLetterTargetArn: dlqArn,
      maxReceiveCount: service.deadLetter.maxRetries
    });
  }

  if (isFifo) {
    mainQueueAttributes.FifoQueue = 'true';

    if (!service.fifoMode!.uniqueId) {
      mainQueueAttributes.ContentBasedDeduplication = 'true';
    }
  }

  await createQueue(client, queueName, isFifo, mainQueueAttributes);

  Logger.log(`Queue topology ensured for [${service.name}].`);
};

export const purgeQueueTopology = async (client: SQSClient, service: QueueService, options: ServeOptions) => {
  const isFifo = !!service.fifoMode;
  const identifier = getServiceName(service.name, options);
  const queueName = getQueueName(identifier, isFifo);

  const { QueueUrl } = await client.send(new GetQueueUrlCommand({ QueueName: queueName }));

  await client.send(new PurgeQueueCommand({ QueueUrl }));

  Logger.log(`Queue purged for [${service.name}].`);
};

const createQueue = async (client: SQSClient, queueName: string, isFifo: boolean, attributes?: Record<string, string>) => {
  const { QueueUrl } = await client.send(
    new CreateQueueCommand({
      QueueName: queueName,
      Attributes: {
        ...(isFifo && { FifoQueue: 'true' }),
        ...attributes
      }
    })
  );

  return QueueUrl!;
};

const getQueueArn = async (client: SQSClient, queueUrl: string) => {
  const { Attributes } = await client.send(
    new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['QueueArn']
    })
  );

  return Attributes!.QueueArn!;
};
