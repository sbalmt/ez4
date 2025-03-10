import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  SNSClient,
  CreateTopicCommand,
  DeleteTopicCommand,
  TagResourceCommand,
  UntagResourceCommand,
  NotFoundException
} from '@aws-sdk/client-sns';

import { getTagList, Logger } from '@ez4/aws-common';

import { TopicServiceName } from './types.js';

const client = new SNSClient({});

export type CreateRequest = {
  topicName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  topicArn: Arn;
};

export const createTopic = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(TopicServiceName, request.topicName);

  const response = await client.send(
    new CreateTopicCommand({
      Name: request.topicName,
      Attributes: {},
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
  Logger.logDelete(TopicServiceName, topicArn);

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
  Logger.logTag(TopicServiceName, topicArn);

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
  Logger.logUntag(TopicServiceName, topicArn);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: topicArn,
      TagKeys: tagKeys
    })
  );
};
