import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  RDSClient,
  CreateDBInstanceCommand,
  DeleteDBInstanceCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  waitUntilDBInstanceAvailable,
  waitUntilDBInstanceDeleted
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
  clusterName?: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  instanceName: string;
  instanceArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'instanceName' | 'tags'>>;

export type UpdateResponse = CreateResponse;

export const createInstance = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(InstanceServiceName, request.instanceName);

  const { instanceName, clusterName, tags } = request;

  const response = await client.send(
    new CreateDBInstanceCommand({
      DBClusterIdentifier: clusterName,
      DBInstanceIdentifier: instanceName,
      DBInstanceClass: 'db.serverless',
      Engine: 'aurora-postgresql',
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  await waitUntilDBInstanceAvailable(waiter, {
    DBInstanceIdentifier: instanceName
  });

  const dbInstance = response.DBInstance!;

  return {
    instanceName,
    instanceArn: dbInstance.DBInstanceArn as Arn
  };
};

export const tagInstance = async (instanceArn: Arn, tags: ResourceTags) => {
  Logger.logTag(InstanceServiceName, instanceArn);

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
  Logger.logUntag(InstanceServiceName, instanceArn);

  await client.send(
    new RemoveTagsFromResourceCommand({
      ResourceName: instanceArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteInstance = async (instanceName: string) => {
  Logger.logDelete(InstanceServiceName, instanceName);

  await client.send(
    new DeleteDBInstanceCommand({
      DBInstanceIdentifier: instanceName,
      SkipFinalSnapshot: true
    })
  );

  await waitUntilDBInstanceDeleted(waiter, {
    DBInstanceIdentifier: instanceName
  });
};
