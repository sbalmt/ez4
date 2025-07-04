import type { QueueAttributeName } from '@aws-sdk/client-sqs';
import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  SQSClient,
  GetQueueUrlCommand,
  CreateQueueCommand,
  DeleteQueueCommand,
  SetQueueAttributesCommand,
  TagQueueCommand,
  UntagQueueCommand,
  QueueDoesNotExist
} from '@aws-sdk/client-sqs';

import { Logger, waitCreation } from '@ez4/aws-common';
import { isEmptyObject } from '@ez4/utils';

import { parseQueueUrl } from './helpers/url.js';
import { QueueServiceName } from './types.js';

const client = new SQSClient({});

export type DeadLetter = {
  targetQueueArn: Arn;
  maxRetries: number;
};

export type CreateRequest = {
  queueName: string;
  fifoMode: boolean;
  deadLetter?: DeadLetter;
  retention?: number;
  polling?: number;
  timeout?: number;
  delay?: number;
  tags?: ResourceTags;
};

export type CreateResponse = {
  queueUrl: string;
};

export type UpdateRequest = Pick<CreateRequest, 'timeout' | 'retention' | 'polling' | 'delay' | 'deadLetter'>;

export const fetchQueue = async (queueName: string) => {
  Logger.logFetch(QueueServiceName, queueName);

  const response = await client.send(
    new GetQueueUrlCommand({
      QueueName: queueName
    })
  );

  return {
    queueUrl: response.QueueUrl!
  };
};

export const createQueue = async (request: CreateRequest): Promise<CreateResponse> => {
  const { queueName, fifoMode } = request;

  Logger.logCreate(QueueServiceName, queueName);

  const response = await waitCreation(async () => {
    return client.send(
      new CreateQueueCommand({
        QueueName: queueName,
        Attributes: {
          ...upsertQueueAttributes(request),
          ...(fifoMode && {
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
  }, ['QueueDeletedRecently']);

  return {
    queueUrl: response.QueueUrl!
  };
};

export const updateQueue = async (queueUrl: string, request: UpdateRequest) => {
  const { queueName } = parseQueueUrl(queueUrl);

  Logger.logUpdate(QueueServiceName, queueName);

  const attributes = upsertQueueAttributes(request);

  if (isEmptyObject(attributes)) {
    return;
  }

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: attributes
    })
  );
};

export const tagQueue = async (queueUrl: string, tags: ResourceTags) => {
  const { queueName } = parseQueueUrl(queueUrl);

  Logger.logTag(QueueServiceName, queueName);

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
  const { queueName } = parseQueueUrl(queueUrl);

  Logger.logUntag(QueueServiceName, queueName);

  await client.send(
    new UntagQueueCommand({
      QueueUrl: queueUrl,
      TagKeys: tagKeys
    })
  );
};

export const deleteQueue = async (queueUrl: string) => {
  const { queueName } = parseQueueUrl(queueUrl);

  Logger.logDelete(QueueServiceName, queueName);

  try {
    await client.send(
      new DeleteQueueCommand({
        QueueUrl: queueUrl
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof QueueDoesNotExist)) {
      throw error;
    }

    return false;
  }
};

const upsertQueueAttributes = (request: CreateRequest | UpdateRequest): Partial<Record<QueueAttributeName, string>> => {
  const { timeout, retention, polling, delay, deadLetter } = request;

  return {
    ...(timeout !== undefined && { VisibilityTimeout: timeout.toString() }),
    ...(retention !== undefined && { MessageRetentionPeriod: (retention * 60).toString() }),
    ...(polling !== undefined && { ReceiveMessageWaitTimeSeconds: polling.toString() }),
    ...(delay !== undefined && { DelaySeconds: delay.toString() }),
    ...(deadLetter && {
      RedrivePolicy: JSON.stringify({
        deadLetterTargetArn: deadLetter.targetQueueArn,
        maxReceiveCount: deadLetter.maxRetries
      })
    })
  };
};
