import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  SNSClient,
  CreateTopicCommand,
  DeleteTopicCommand,
  TagResourceCommand,
  UntagResourceCommand,
  NotFoundException
} from '@aws-sdk/client-sns';

import { getTagList, Logger, tryParseArn } from '@ez4/aws-common';

import { TopicServiceName } from './types';

const client = new SNSClient({});

export type CreateRequest = {
  topicName: string;
  fifoMode: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  topicArn: Arn;
};

export const createTopic = async (request: CreateRequest): Promise<CreateResponse> => {
  const { topicName, fifoMode } = request;

  Logger.logCreate(TopicServiceName, topicName);

  const response = await client.send(
    new CreateTopicCommand({
      Name: topicName,
      Attributes: {
        ...(fifoMode && {
          ContentBasedDeduplication: 'true',
          FifoThroughputScope: 'MessageGroup',
          FifoTopic: 'true'
        })
      },
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  return {
    topicArn: response.TopicArn as Arn
  };
};

export const deleteTopic = async (topicArn: string) => {
  const topicName = tryParseArn(topicArn)?.resourceName ?? topicArn;

  Logger.logDelete(TopicServiceName, topicName);

  try {
    await client.send(
      new DeleteTopicCommand({
        TopicArn: topicArn
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }

    return false;
  }
};

export const tagTopic = async (topicArn: string, tags: ResourceTags) => {
  const topicName = tryParseArn(topicArn)?.resourceName ?? topicArn;

  Logger.logTag(TopicServiceName, topicName);

  await client.send(
    new TagResourceCommand({
      ResourceArn: topicArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagTopic = async (topicArn: string, tagKeys: string[]) => {
  const topicName = tryParseArn(topicArn)?.resourceName ?? topicArn;

  Logger.logUntag(TopicServiceName, topicName);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: topicArn,
      TagKeys: tagKeys
    })
  );
};
