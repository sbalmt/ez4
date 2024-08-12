import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  CreateQueueCommand,
  SetQueueAttributesCommand,
  DeleteQueueCommand,
  SQSClient,
  TagQueueCommand,
  UntagQueueCommand
} from '@aws-sdk/client-sqs';

import { getAccountId, getRegion } from '@ez4/aws-identity';
import { Logger } from '@ez4/aws-common';

import { QueueServiceName } from './types.js';

const client = new SQSClient({});

export type CreateRequest = {
  queueName: string;
  timeout?: number;
  retention?: number;
  delay?: number;
  tags?: ResourceTags;
};

export type CreateResponse = {
  queueUrl: string;
  queueArn: Arn;
};

export type UpdateRequest = {
  timeout?: number;
  retention?: number;
  delay?: number;
};

export const createQueue = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(QueueServiceName, request.queueName);

  const { timeout, retention, delay } = request;

  const [region, accountId, response] = await Promise.all([
    getRegion(),
    getAccountId(),
    client.send(
      new CreateQueueCommand({
        QueueName: request.queueName,
        Attributes: {
          ...(timeout !== undefined && { VisibilityTimeout: timeout.toString() }),
          ...(retention !== undefined && { MessageRetentionPeriod: (retention * 60).toString() }),
          ...(delay !== undefined && { DelaySeconds: delay.toString() })
        },
        tags: {
          ...request.tags,
          ManagedBy: 'EZ4'
        }
      })
    )
  ]);

  return {
    queueUrl: response.QueueUrl!,
    queueArn: `arn:aws:sqs:${region}:${accountId}:${request.queueName}` as Arn
  };
};

export const updateQueue = async (queueUrl: string, request: UpdateRequest) => {
  Logger.logUpdate(QueueServiceName, queueUrl);

  const { timeout, retention, delay } = request;

  await client.send(
    new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        ...(timeout !== undefined && { VisibilityTimeout: timeout.toString() }),
        ...(retention !== undefined && { MessageRetentionPeriod: (retention * 60).toString() }),
        ...(delay !== undefined && { DelaySeconds: delay.toString() })
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
