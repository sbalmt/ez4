import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger } from '@ez4/aws-common';

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

import { getRandomPassword } from '../utils/credentials.js';
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
  database?: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  clusterName: string;
  clusterArn: Arn;
  writerEndpoint: string;
  readerEndpoint: string;
  secretArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'clusterName' | 'database' | 'tags'>>;

export type UpdateResponse = CreateResponse;

export const createCluster = async (request: CreateRequest): Promise<CreateResponse> => {
  const { clusterName } = request;

  Logger.logCreate(ClusterServiceName, clusterName);

  const response = await client.send(
    new CreateDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DatabaseName: request.database,
      DeletionProtection: !request.allowDeletion,
      EnablePerformanceInsights: request.enableInsights,
      EnableHttpEndpoint: request.enableHttp,
      MasterUsername: getRandomPassword(),
      ManageMasterUserPassword: true,
      AutoMinorVersionUpgrade: true,
      BackupRetentionPeriod: 7,
      StorageEncrypted: true,
      EngineMode: 'provisioned',
      Engine: 'aurora-postgresql',
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0.5,
        MaxCapacity: 8
      },
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  await waitUntilDBClusterAvailable(waiter, {
    DBClusterIdentifier: clusterName
  });

  const { DBClusterArn, MasterUserSecret, Endpoint, ReaderEndpoint } = response.DBCluster!;

  return {
    clusterName,
    clusterArn: DBClusterArn as Arn,
    secretArn: MasterUserSecret!.SecretArn as Arn,
    readerEndpoint: ReaderEndpoint!,
    writerEndpoint: Endpoint!
  };
};

export const updateCluster = async (
  clusterName: string,
  request: UpdateRequest
): Promise<UpdateResponse> => {
  Logger.logUpdate(ClusterServiceName, clusterName);

  const response = await client.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DeletionProtection: !request.allowDeletion,
      EnablePerformanceInsights: request.enableInsights,
      EnableHttpEndpoint: request.enableHttp,
      RotateMasterUserPassword: true,
      ApplyImmediately: true
    })
  );

  await waitUntilDBClusterAvailable(waiter, {
    DBClusterIdentifier: clusterName
  });

  const { DBClusterArn, MasterUserSecret, Endpoint, ReaderEndpoint } = response.DBCluster!;

  return {
    clusterName,
    clusterArn: DBClusterArn as Arn,
    secretArn: MasterUserSecret!.SecretArn as Arn,
    readerEndpoint: ReaderEndpoint!,
    writerEndpoint: Endpoint!
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
