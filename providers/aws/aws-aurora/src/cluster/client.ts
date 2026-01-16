import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import { getTagList } from '@ez4/aws-common';

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

export const importCluster = async (
  logger: Logger.OperationLogger | undefined,
  clusterName: string
): Promise<ImportOrCreateResponse | undefined> => {
  logger?.update(`Importing cluster`);

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

export const createCluster = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating cluster`);

  const { clusterName, scalability } = request;

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

export const updateCluster = async (
  logger: Logger.OperationLogger,
  clusterName: string,
  request: UpdateRequest
): Promise<UpdateResponse> => {
  logger.update(`Updating cluster`);

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

export const updateDeletion = async (logger: Logger.OperationLogger, clusterName: string, allowDeletion: boolean) => {
  logger.update(`Updating deletion protection`);

  await client.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: clusterName,
      DeletionProtection: !allowDeletion
    })
  );
};

export const tagCluster = async (logger: Logger.OperationLogger, clusterArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag cluster`);

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

export const untagCluster = async (logger: Logger.OperationLogger, clusterArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag cluster`);

  await client.send(
    new RemoveTagsFromResourceCommand({
      ResourceName: clusterArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteCluster = async (logger: Logger.OperationLogger, clusterName: string) => {
  logger.update(`Deleting cluster`);

  try {
    await client.send(
      new DeleteDBClusterCommand({
        DBClusterIdentifier: clusterName,
        SkipFinalSnapshot: true
      })
    );

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
