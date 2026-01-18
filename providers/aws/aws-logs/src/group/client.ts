import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import {
  CreateLogGroupCommand,
  DeleteLogGroupCommand,
  PutRetentionPolicyCommand,
  DeleteRetentionPolicyCommand,
  TagResourceCommand,
  UntagResourceCommand,
  ResourceAlreadyExistsException,
  ResourceNotFoundException
} from '@aws-sdk/client-cloudwatch-logs';

import { getCloudWatchLogsClient } from '../utils/deploy';
import { getLogGroupArn } from '../utils/group';

export type CreateRequest = {
  groupName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  groupArn: Arn;
};

export const createGroup = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating log group`);

  const { groupName } = request;

  try {
    await getCloudWatchLogsClient().send(
      new CreateLogGroupCommand({
        logGroupName: groupName,
        tags: {
          ...request.tags,
          ManagedBy: 'EZ4'
        }
      })
    );
  } catch (error) {
    if (!(error instanceof ResourceAlreadyExistsException)) {
      throw error;
    }
  }

  const groupArn = await getLogGroupArn(groupName);

  return {
    groupArn
  };
};

export const createRetention = async (logger: Logger.OperationLogger, groupName: string, retention: number) => {
  logger.update(`Updating log group retention`);

  return getCloudWatchLogsClient().send(
    new PutRetentionPolicyCommand({
      retentionInDays: retention,
      logGroupName: groupName
    })
  );
};

export const deleteRetention = async (logger: Logger.OperationLogger, groupName: string) => {
  logger.update(`Deleting log group retention`);

  await getCloudWatchLogsClient().send(
    new DeleteRetentionPolicyCommand({
      logGroupName: groupName
    })
  );
};

export const tagGroup = async (logger: Logger.OperationLogger, groupArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag log group`);

  await getCloudWatchLogsClient().send(
    new TagResourceCommand({
      resourceArn: groupArn,
      tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagGroup = async (logger: Logger.OperationLogger, groupArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag log group`);

  await getCloudWatchLogsClient().send(
    new UntagResourceCommand({
      resourceArn: groupArn,
      tagKeys
    })
  );
};

export const deleteGroup = async (logger: Logger.OperationLogger, groupName: string) => {
  logger.update(`Deleting log group`);

  try {
    await getCloudWatchLogsClient().send(
      new DeleteLogGroupCommand({
        logGroupName: groupName
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};
