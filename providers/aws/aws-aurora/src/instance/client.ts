import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { Logger } from '@ez4/aws-common';

import { getTagList } from '@ez4/aws-common';

import {
  RDSClient,
  CreateDBInstanceCommand,
  DeleteDBInstanceCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  waitUntilDBInstanceAvailable,
  waitUntilDBInstanceDeleted,
  DBInstanceNotFoundFault,
  DescribeDBInstancesCommand
} from '@aws-sdk/client-rds';

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

export type ImportOrCreateResponse = {
  instanceName: string;
  instanceArn: Arn;
};

export const importInstance = async (instanceName: string, logger: Logger.OperationLogger): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing instance`);

  try {
    const response = await client.send(
      new DescribeDBInstancesCommand({
        DBInstanceIdentifier: instanceName,
        MaxRecords: 20
      })
    );

    const [{ DBInstanceArn }] = response.DBInstances!;

    return {
      instanceArn: DBInstanceArn as Arn,
      instanceName
    };
  } catch (error) {
    if (!(error instanceof DBInstanceNotFoundFault)) {
      throw error;
    }

    return undefined;
  }
};

export const createInstance = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating instance`);

  const { instanceName, clusterName } = request;

  const response = await client.send(
    new CreateDBInstanceCommand({
      DBInstanceIdentifier: instanceName,
      DBClusterIdentifier: clusterName,
      DBInstanceClass: 'db.serverless',
      Engine: 'aurora-postgresql',
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  await waitUntilDBInstanceAvailable(waiter, {
    DBInstanceIdentifier: instanceName
  });

  const { DBInstanceArn } = response.DBInstance!;

  return {
    instanceArn: DBInstanceArn as Arn,
    instanceName
  };
};

export const tagInstance = async (instanceArn: Arn, logger: Logger.OperationLogger, tags: ResourceTags) => {
  logger.update(`Tag instance`);

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

export const untagInstance = async (instanceArn: Arn, logger: Logger.OperationLogger, tagKeys: string[]) => {
  logger.update(`Untag instance`);

  await client.send(
    new RemoveTagsFromResourceCommand({
      ResourceName: instanceArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteInstance = async (instanceName: string, logger: Logger.OperationLogger) => {
  logger.update(`Deleting instance`);

  try {
    await client.send(
      new DeleteDBInstanceCommand({
        DBInstanceIdentifier: instanceName,
        SkipFinalSnapshot: true
      })
    );

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
