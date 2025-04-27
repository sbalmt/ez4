import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  DeleteLogGroupCommand,
  TagResourceCommand,
  UntagResourceCommand,
  ResourceAlreadyExistsException,
  ResourceNotFoundException
} from '@aws-sdk/client-cloudwatch-logs';

import { Logger, tryParseArn } from '@ez4/aws-common';

import { getGroupArn } from '../utils/group.js';
import { GroupServiceName } from './types.js';

const client = new CloudWatchLogsClient({});

export type CreateRequest = {
  groupName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  groupArn: Arn;
};

export const createGroup = async (request: CreateRequest): Promise<CreateResponse> => {
  const { groupName } = request;

  Logger.logCreate(GroupServiceName, groupName);

  try {
    await client.send(
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

  const groupArn = await getGroupArn(groupName);

  return {
    groupArn
  };
};

export const tagGroup = async (groupArn: Arn, tags: ResourceTags) => {
  const groupName = tryParseArn(groupArn)?.resourceName ?? groupArn;

  Logger.logTag(GroupServiceName, groupName);

  await client.send(
    new TagResourceCommand({
      resourceArn: groupArn,
      tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagGroup = async (groupArn: Arn, tagKeys: string[]) => {
  const groupName = tryParseArn(groupArn)?.resourceName ?? groupArn;

  Logger.logUntag(GroupServiceName, groupName);

  await client.send(
    new UntagResourceCommand({
      resourceArn: groupArn,
      tagKeys
    })
  );
};

export const deleteGroup = async (groupName: string) => {
  Logger.logDelete(GroupServiceName, groupName);

  try {
    await client.send(
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
