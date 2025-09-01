import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  DeleteLogGroupCommand,
  PutRetentionPolicyCommand,
  DeleteRetentionPolicyCommand,
  TagResourceCommand,
  UntagResourceCommand,
  ResourceAlreadyExistsException,
  ResourceNotFoundException
} from '@aws-sdk/client-cloudwatch-logs';

import { Logger, tryParseArn, waitCreation } from '@ez4/aws-common';

import { getLogGroupArn } from '../utils/group';
import { LogGroupServiceName } from './types';

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

  Logger.logCreate(LogGroupServiceName, groupName);

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

  const groupArn = await getLogGroupArn(groupName);

  return {
    groupArn
  };
};

export const createRetention = async (groupName: string, retention: number) => {
  Logger.logCreate(LogGroupServiceName, `${groupName} retention`);

  await waitCreation(() => {
    return client.send(
      new PutRetentionPolicyCommand({
        retentionInDays: retention,
        logGroupName: groupName
      })
    );
  });
};

export const deleteRetention = async (groupName: string) => {
  Logger.logDelete(LogGroupServiceName, `${groupName} retention`);

  await client.send(
    new DeleteRetentionPolicyCommand({
      logGroupName: groupName
    })
  );
};

export const tagGroup = async (groupArn: Arn, tags: ResourceTags) => {
  const groupName = tryParseArn(groupArn)?.resourceName ?? groupArn;

  Logger.logTag(LogGroupServiceName, groupName);

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

  Logger.logUntag(LogGroupServiceName, groupName);

  await client.send(
    new UntagResourceCommand({
      resourceArn: groupArn,
      tagKeys
    })
  );
};

export const deleteGroup = async (groupName: string) => {
  Logger.logDelete(LogGroupServiceName, groupName);

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
