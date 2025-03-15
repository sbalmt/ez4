import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger, tryParseArn } from '@ez4/aws-common';

import {
  RDSClient,
  CreateDBInstanceCommand,
  DeleteDBInstanceCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  waitUntilDBInstanceAvailable,
  waitUntilDBInstanceDeleted,
  DBInstanceNotFoundFault
} from '@aws-sdk/client-rds';

import { InstanceServiceName } from './types.js';

const client = new RDSClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export type CreateRequest = {
  instanceName: string;
  clusterName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  instanceName: string;
  instanceArn: Arn;
};

export const createInstance = async (request: CreateRequest): Promise<CreateResponse> => {
  const { instanceName } = request;

  Logger.logCreate(InstanceServiceName, instanceName);

  const response = await client.send(
    new CreateDBInstanceCommand({
      DBInstanceIdentifier: instanceName,
      DBClusterIdentifier: request.clusterName,
      DBInstanceClass: 'db.serverless',
      Engine: 'aurora-postgresql',
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  Logger.logWait(InstanceServiceName, instanceName);

  await waitUntilDBInstanceAvailable(waiter, {
    DBInstanceIdentifier: instanceName
  });

  const { DBInstanceArn } = response.DBInstance!;

  return {
    instanceName,
    instanceArn: DBInstanceArn as Arn
  };
};

export const tagInstance = async (instanceArn: Arn, tags: ResourceTags) => {
  const instanceName = tryParseArn(instanceArn)?.resourceName ?? instanceArn;

  Logger.logTag(InstanceServiceName, instanceName);

  await client.send(
    new AddTagsToResourceCommand({
      ResourceName: instanceArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagInstance = async (instanceArn: Arn, tagKeys: string[]) => {
  const instanceName = tryParseArn(instanceArn)?.resourceName ?? instanceArn;

  Logger.logUntag(InstanceServiceName, instanceName);

  await client.send(
    new RemoveTagsFromResourceCommand({
      ResourceName: instanceArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteInstance = async (instanceName: string) => {
  Logger.logDelete(InstanceServiceName, instanceName);

  try {
    await client.send(
      new DeleteDBInstanceCommand({
        DBInstanceIdentifier: instanceName,
        SkipFinalSnapshot: true
      })
    );

    Logger.logWait(InstanceServiceName, instanceName);

    await waitUntilDBInstanceDeleted(waiter, {
      DBInstanceIdentifier: instanceName
    });

    return true;
  } catch (error) {
    if (!(error instanceof DBInstanceNotFoundFault)) {
      throw error;
    }

    return false;
  }
};
