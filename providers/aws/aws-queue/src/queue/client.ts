import type { QueueAttributeName } from '@aws-sdk/client-sqs';
import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import {
  GetQueueUrlCommand,
  CreateQueueCommand,
  DeleteQueueCommand,
  SetQueueAttributesCommand,
  TagQueueCommand,
  UntagQueueCommand,
  QueueDoesNotExist
} from '@aws-sdk/client-sqs';

import { waitCreation } from '@ez4/aws-common';
import { isEmptyObject } from '@ez4/utils';

import { getSQSClient } from '../utils/deploy';

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

export const fetchQueue = async (logger: Logger.OperationLogger, queueName: string) => {
  logger.update(`Fetching queue`);

  const response = await getSQSClient().send(
    new GetQueueUrlCommand({
      QueueName: queueName
    })
  );

  return {
    queueUrl: response.QueueUrl!
  };
};

export const createQueue = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating queue`);

  const { queueName, fifoMode } = request;

  const client = getSQSClient();

  // If the queue was deleted less than 1 minute ago, the creation will fail.
  // The `waitCreation` will keep retrying until max attempts.
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

export const updateQueue = async (logger: Logger.OperationLogger, queueUrl: string, request: UpdateRequest) => {
  logger.update(`Updating queue`);

  const attributes = upsertQueueAttributes(request);

  if (isEmptyObject(attributes)) {
    return;
  }

  await getSQSClient().send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: attributes
    })
  );
};

export const tagQueue = async (logger: Logger.OperationLogger, queueUrl: string, tags: ResourceTags) => {
  logger.update(`Tag queue`);

  await getSQSClient().send(
    new TagQueueCommand({
      QueueUrl: queueUrl,
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagQueue = async (logger: Logger.OperationLogger, queueUrl: string, tagKeys: string[]) => {
  logger.update(`Untag queue`);

  await getSQSClient().send(
    new UntagQueueCommand({
      QueueUrl: queueUrl,
      TagKeys: tagKeys
    })
  );
};

export const deleteQueue = async (logger: Logger.OperationLogger, queueUrl: string) => {
  logger.update(`Delete queue`);

  try {
    await getSQSClient().send(
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
