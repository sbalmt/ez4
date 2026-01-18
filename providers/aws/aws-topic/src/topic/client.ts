import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import { CreateTopicCommand, DeleteTopicCommand, TagResourceCommand, UntagResourceCommand, NotFoundException } from '@aws-sdk/client-sns';
import { getTagList } from '@ez4/aws-common';

import { getSNSClient } from '../utils/deploy';

export type CreateRequest = {
  topicName: string;
  fifoMode: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  topicArn: Arn;
};

export const createTopic = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating topic`);

  const { topicName, fifoMode } = request;

  const response = await getSNSClient().send(
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

export const deleteTopic = async (logger: Logger.OperationLogger, topicArn: string) => {
  logger.update(`Deleting topic`);

  try {
    await getSNSClient().send(
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

export const tagTopic = async (logger: Logger.OperationLogger, topicArn: string, tags: ResourceTags) => {
  logger.update(`Tag topic`);

  await getSNSClient().send(
    new TagResourceCommand({
      ResourceArn: topicArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagTopic = async (logger: Logger.OperationLogger, topicArn: string, tagKeys: string[]) => {
  logger.update(`Untag topic`);

  await getSNSClient().send(
    new UntagResourceCommand({
      ResourceArn: topicArn,
      TagKeys: tagKeys
    })
  );
};
