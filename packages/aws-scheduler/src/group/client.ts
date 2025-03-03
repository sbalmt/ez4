import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  SchedulerClient,
  GetScheduleGroupCommand,
  CreateScheduleGroupCommand,
  DeleteScheduleGroupCommand,
  TagResourceCommand,
  UntagResourceCommand,
  ResourceNotFoundException
} from '@aws-sdk/client-scheduler';

import { getTagList, Logger } from '@ez4/aws-common';
import { GroupServiceName } from './types.js';

const client = new SchedulerClient({});

export type CreateRequest = {
  groupName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  groupArn: Arn;
};

export const importGroup = async (groupName: string) => {
  Logger.logImport(GroupServiceName, groupName);

  try {
    const response = await client.send(
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

export const createGroup = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(GroupServiceName, request.groupName);

  const response = await client.send(
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

export const deleteGroup = async (groupName: string) => {
  Logger.logDelete(GroupServiceName, groupName);

  await client.send(
    new DeleteScheduleGroupCommand({
      Name: groupName
    })
  );
};

export const tagGroup = async (groupArn: Arn, tags: ResourceTags) => {
  Logger.logTag(GroupServiceName, groupArn);

  await client.send(
    new TagResourceCommand({
      ResourceArn: groupArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagGroup = async (groupArn: Arn, tagKeys: string[]) => {
  Logger.logUntag(GroupServiceName, groupArn);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: groupArn,
      TagKeys: tagKeys
    })
  );
};
