import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger, tryParseArn } from '@ez4/aws-common';

import {
  RDSClient,
  CreateDBClusterCommand,
  DescribeDBClustersCommand,
  ModifyDBClusterCommand,
  DeleteDBClusterCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  waitUntilDBClusterAvailable,
  waitUntilDBClusterDeleted,
  DBClusterNotFoundFault
} from '@aws-sdk/client-rds';

import { getRandomPassword } from '../utils/credentials';
import { ClusterServiceName } from './types';

const client = new RDSClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export type Scalability = {
  minCapacity: number;
  maxCapacity: number;
};

export type CreateRequest = {
  clusterName: string;
  allowDeletion?: boolean;
  scalability?: Scalability | null;
  enableInsights?: boolean;
  enableHttp?: boolean;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  clusterArn: Arn;
  writerEndpoint: string;
  readerEndpoint: string;
  secretArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'clusterName' | 'database' | 'tags'>>;

export type UpdateResponse = ImportOrCreateResponse;

export const importCluster = async (clusterName: string, log = true): Promise<ImportOrCreateResponse | undefined> => {
  if (log) {
    Logger.logImport(ClusterServiceName, clusterName);
  }

  try {
    const response = await client.send(
      new DescribeDBClustersCommand({
        DBClusterIdentifier: clusterName,
        MaxRecords: 20
      })
    );

    const [{ DBClusterArn, MasterUserSecret, Endpoint, ReaderEndpoint }] = response.DBClusters!;

    return {
      clusterArn: DBClusterArn as Arn,
      secretArn: MasterUserSecret!.SecretArn as Arn,
      readerEndpoint: ReaderEndpoint!,
      writerEndpoint: Endpoint!
    };
  } catch (error) {
    if (!(error instanceof DBClusterNotFoundFault)) {
      throw error;
    }

    return undefined;
  }
};

export const createCluster = async (request: CreateRequest): Promise<ImportOrCreateResponse> => {
  const { clusterName, scalability } = request;

  Logger.logCreate(ClusterServiceName, clusterName);

  const canPause = scalability?.minCapacity === 0;

  const response = await client.send(
    new CreateDBClusterCommand({
      DBClusterIdentifier: clusterName,
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
        MinCapacity: scalability?.minCapacity ?? 0,
        MaxCapacity: scalability?.maxCapacity ?? 8,
        ...(canPause && {
          SecondsUntilAutoPause: 300
        })
      },
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  Logger.logWait(ClusterServiceName, clusterName);

  await waitUntilDBClusterAvailable(waiter, {
    DBClusterIdentifier: clusterName
  });

  const { DBClusterArn, MasterUserSecret, Endpoint, ReaderEndpoint } = response.DBCluster!;

  return {
    clusterArn: DBClusterArn as Arn,
    secretArn: MasterUserSecret!.SecretArn as Arn,
    readerEndpoint: ReaderEndpoint!,
    writerEndpoint: Endpoint!
  };
};

export const updateCluster = async (clusterName: string, request: UpdateRequest): Promise<UpdateResponse> => {
  Logger.logUpdate(ClusterServiceName, clusterName);

  const { scalability } = request;

  const canPause = scalability?.minCapacity === 0;

  const response = await client.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DeletionProtection: !request.allowDeletion,
      EnablePerformanceInsights: request.enableInsights,
      EnableHttpEndpoint: request.enableHttp,
      RotateMasterUserPassword: true,
      ApplyImmediately: true,
      ServerlessV2ScalingConfiguration: {
        MinCapacity: scalability?.minCapacity ?? 0,
        MaxCapacity: scalability?.maxCapacity ?? 8,
        ...(canPause && {
          SecondsUntilAutoPause: 300
        })
      }
    })
  );

  Logger.logWait(ClusterServiceName, clusterName);

  await waitUntilDBClusterAvailable(waiter, {
    DBClusterIdentifier: clusterName
  });

  const { DBClusterArn, MasterUserSecret, Endpoint, ReaderEndpoint } = response.DBCluster!;

  return {
    clusterArn: DBClusterArn as Arn,
    secretArn: MasterUserSecret!.SecretArn as Arn,
    readerEndpoint: ReaderEndpoint!,
    writerEndpoint: Endpoint!
  };
};

export const updateDeletion = async (clusterName: string, allowDeletion: boolean) => {
  Logger.logUpdate(ClusterServiceName, clusterName);

  await client.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DeletionProtection: !allowDeletion
    })
  );
};

export const tagCluster = async (clusterArn: Arn, tags: ResourceTags) => {
  const clusterName = tryParseArn(clusterArn)?.resourceName ?? clusterArn;

  Logger.logTag(ClusterServiceName, clusterName);

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
  const clusterName = tryParseArn(clusterArn)?.resourceName ?? clusterArn;

  Logger.logUntag(ClusterServiceName, clusterName);

  await client.send(
    new RemoveTagsFromResourceCommand({
      ResourceName: clusterArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteCluster = async (clusterName: string) => {
  Logger.logDelete(ClusterServiceName, clusterName);

  try {
    await client.send(
      new DeleteDBClusterCommand({
        DBClusterIdentifier: clusterName,
        SkipFinalSnapshot: true
      })
    );

    Logger.logWait(ClusterServiceName, clusterName);

    await waitUntilDBClusterDeleted(waiter, {
      DBClusterIdentifier: clusterName
    });

    return true;
  } catch (error) {
    if (!(error instanceof DBClusterNotFoundFault)) {
      throw error;
    }

    return false;
  }
};
