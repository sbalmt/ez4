import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  CreateQueueCommand,
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
  tags?: ResourceTags;
};

export type CreateResponse = {
  queueUrl: string;
  queueArn: Arn;
};

export const createQueue = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(QueueServiceName, request.queueName);

  const [region, accountId, response] = await Promise.all([
    getRegion(),
    getAccountId(),
    client.send(
      new CreateQueueCommand({
        QueueName: request.queueName,
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
