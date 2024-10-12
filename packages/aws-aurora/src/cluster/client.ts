import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger } from '@ez4/aws-common';

import { randomBytes } from 'crypto';

import {
  RDSClient,
  CreateDBClusterCommand,
  ModifyDBClusterCommand,
  DeleteDBClusterCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  waitUntilDBClusterAvailable,
  waitUntilDBClusterDeleted
} from '@aws-sdk/client-rds';

import { ClusterServiceName } from './types.js';

const client = new RDSClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export type CreateRequest = {
  clusterName: string;
  allowDeletion?: boolean;
  enableInsights?: boolean;
  enableHttp?: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  clusterName: string;
  clusterArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'clusterName' | 'tags'>>;

export type UpdateResponse = CreateResponse;

export const createCluster = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(ClusterServiceName, request.clusterName);

  const { clusterName, enableInsights, enableHttp, allowDeletion, tags } = request;

  const masterUsername = `e${randomBytes(7).toString('hex')}`;

  const response = await client.send(
    new CreateDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DeletionProtection: !allowDeletion,
      EnablePerformanceInsights: enableInsights,
      EnableHttpEndpoint: enableHttp,
      MasterUsername: masterUsername,
      ManageMasterUserPassword: true,
      AutoMinorVersionUpgrade: true,
      BackupRetentionPeriod: 7,
      StorageEncrypted: true,
      DatabaseName: 'ez4db',
      EngineMode: 'provisioned',
      Engine: 'aurora-postgresql',
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0.5,
        MaxCapacity: 8
      },
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  await waitUntilDBClusterAvailable(waiter, {
    DBClusterIdentifier: clusterName
  });

  const dbCluster = response.DBCluster!;

  return {
    clusterName,
    clusterArn: dbCluster.DBClusterArn as Arn
  };
};

export const updateCluster = async (
  clusterName: string,
  request: UpdateRequest
): Promise<UpdateResponse> => {
  Logger.logUpdate(ClusterServiceName, clusterName);

  const { enableInsights, enableHttp, allowDeletion } = request;

  const response = await client.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DeletionProtection: !allowDeletion,
      EnablePerformanceInsights: enableInsights,
      EnableHttpEndpoint: enableHttp,
      ApplyImmediately: true
    })
  );

  await waitUntilDBClusterAvailable(waiter, {
    DBClusterIdentifier: clusterName
  });

  const dbCluster = response.DBCluster!;

  return {
    clusterName,
    clusterArn: dbCluster.DBClusterArn as Arn
  };
};

export const tagCluster = async (clusterArn: Arn, tags: ResourceTags) => {
  Logger.logTag(ClusterServiceName, clusterArn);

  await client.send(
    new AddTagsToResourceCommand({
      ResourceName: clusterArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagCluster = async (clusterArn: Arn, tagKeys: string[]) => {
  Logger.logUntag(ClusterServiceName, clusterArn);

  await client.send(
    new RemoveTagsFromResourceCommand({
      ResourceName: clusterArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteCluster = async (clusterName: string) => {
  Logger.logDelete(ClusterServiceName, clusterName);

  await client.send(
    new DeleteDBClusterCommand({
      DBClusterIdentifier: clusterName,
      SkipFinalSnapshot: true
    })
  );

  await waitUntilDBClusterDeleted(waiter, {
    DBClusterIdentifier: clusterName
  });
};
