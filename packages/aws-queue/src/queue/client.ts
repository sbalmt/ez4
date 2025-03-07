import type { QueueAttributeName } from '@aws-sdk/client-sqs';
import type { ResourceTags } from '@ez4/aws-common';

import {
  SQSClient,
  GetQueueUrlCommand,
  CreateQueueCommand,
  DeleteQueueCommand,
  SetQueueAttributesCommand,
  TagQueueCommand,
  UntagQueueCommand
} from '@aws-sdk/client-sqs';

import { Logger } from '@ez4/aws-common';

import { QueueServiceName } from './types.js';

const client = new SQSClient({});

export type CreateRequest = {
  queueName: string;
  timeout?: number;
  fifo?: boolean;
  retention?: number;
  polling?: number;
  delay?: number;
  tags?: ResourceTags;
};

export type CreateResponse = {
  queueUrl: string;
};

export type UpdateRequest = Pick<CreateRequest, 'timeout' | 'retention' | 'polling' | 'delay'>;

export const fetchQueue = async (queueName: string, fifo?: boolean) => {
  Logger.logFetch(QueueServiceName, queueName);

  const response = await client.send(
    new GetQueueUrlCommand({
      QueueName: getQueueResourceName(queueName, fifo)
    })
  );

  return {
    queueUrl: response.QueueUrl!
  };
};

export const createQueue = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(QueueServiceName, request.queueName);

  const { queueName, fifo } = request;

  const response = await client.send(
    new CreateQueueCommand({
      QueueName: getQueueResourceName(queueName, fifo),
      Attributes: {
        ...upsertQueueAttributes(request),
        ...(fifo && {
          ContentBasedDeduplication: 'true',
          DeduplicationScope: 'messageGroup',
          FifoThroughputLimit: 'perMessageGroupId',
          FifoQueue: 'true'
        })
      },
      tags: {
        ...request.tags,
        ManagedBy: 'EZ4'
      }
    })
  );

  return {
    queueUrl: response.QueueUrl!
  };
};

export const updateQueue = async (queueUrl: string, request: UpdateRequest) => {
  Logger.logUpdate(QueueServiceName, queueUrl);

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        ...upsertQueueAttributes(request)
      }
    })
  );
};

export const tagQueue = async (queueUrl: string, tags: ResourceTags) => {
  Logger.logTag(QueueServiceName, queueUrl);

  await client.send(
    new TagQueueCommand({
      QueueUrl: queueUrl,
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagQueue = async (queueUrl: string, tagKeys: string[]) => {
  Logger.logUntag(QueueServiceName, queueUrl);

  await client.send(
    new UntagQueueCommand({
      QueueUrl: queueUrl,
      TagKeys: tagKeys
    })
  );
};

export const deleteQueue = async (queueUrl: string) => {
  Logger.logDelete(QueueServiceName, queueUrl);

  await client.send(
    new DeleteQueueCommand({
      QueueUrl: queueUrl
    })
  );
};

const upsertQueueAttributes = (
  request: CreateRequest | UpdateRequest
): Partial<Record<QueueAttributeName, string>> => {
  const { timeout, retention, polling, delay } = request;

  return {
    ...(timeout !== undefined && { VisibilityTimeout: timeout.toString() }),
    ...(retention !== undefined && { MessageRetentionPeriod: (retention * 60).toString() }),
    ...(polling !== undefined && { ReceiveMessageWaitTimeSeconds: polling.toString() }),
    ...(delay !== undefined && { DelaySeconds: delay.toString() })
  };
};

const getQueueResourceName = (queueName: string, fifo?: boolean) => {
  return fifo ? `${queueName}.fifo` : queueName;
};
