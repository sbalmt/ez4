import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import {
  GetScheduleGroupCommand,
  CreateScheduleGroupCommand,
  DeleteScheduleGroupCommand,
  TagResourceCommand,
  UntagResourceCommand,
  ResourceNotFoundException
} from '@aws-sdk/client-scheduler';

import { getTagList } from '@ez4/aws-common';

import { getSchedulerClient } from '../utils/deploy';

export type CreateRequest = {
  groupName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  groupArn: Arn;
};

export const importGroup = async (logger: Logger.OperationLogger, groupName: string) => {
  logger.update(`Importing scheduler group`);

  try {
    const response = await getSchedulerClient().send(
      new GetScheduleGroupCommand({
        Name: groupName
      })
    );

    const groupArn = response.Arn as Arn;

    return {
      groupArn
    };
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return undefined;
  }
};

export const createGroup = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating scheduler group`);

  const response = await getSchedulerClient().send(
    new CreateScheduleGroupCommand({
      Name: request.groupName,
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const groupArn = response.ScheduleGroupArn as Arn;

  return {
    groupArn
  };
};

export const deleteGroup = async (logger: Logger.OperationLogger, groupName: string) => {
  logger.update(`Deleting scheduler group`);

  try {
    await getSchedulerClient().send(
      new DeleteScheduleGroupCommand({
        Name: groupName
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

export const tagGroup = async (logger: Logger.OperationLogger, groupArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag scheduler group`);

  await getSchedulerClient().send(
    new TagResourceCommand({
      ResourceArn: groupArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagGroup = async (logger: Logger.OperationLogger, groupArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag scheduler group`);

  await getSchedulerClient().send(
    new UntagResourceCommand({
      ResourceArn: groupArn,
      TagKeys: tagKeys
    })
  );
};
