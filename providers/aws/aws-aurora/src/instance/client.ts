import type { Arn, OperationLogLine, ResourceTags } from '@ez4/aws-common';

import { getTagList } from '@ez4/aws-common';

import {
  CreateDBInstanceCommand,
  DeleteDBInstanceCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  waitUntilDBInstanceAvailable,
  waitUntilDBInstanceDeleted,
  DBInstanceNotFoundFault,
  DescribeDBInstancesCommand
} from '@aws-sdk/client-rds';

import { getRDSClient, getRDSWaiter } from '../utils/deploy';

export type CreateRequest = {
  instanceName: string;
  clusterName: string;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  instanceName: string;
  instanceArn: Arn;
};

export const importInstance = async (logger: OperationLogLine, instanceName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing instance`);

  try {
    const response = await getRDSClient().send(
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

export const createInstance = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating instance`);

  const { instanceName, clusterName } = request;

  const client = getRDSClient();

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

  await waitUntilDBInstanceAvailable(getRDSWaiter(client), {
    DBInstanceIdentifier: instanceName
  });

  const { DBInstanceArn } = response.DBInstance!;

  return {
    instanceArn: DBInstanceArn as Arn,
    instanceName
  };
};

export const tagInstance = async (logger: OperationLogLine, instanceArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag instance`);

  await getRDSClient().send(
    new AddTagsToResourceCommand({
      ResourceName: instanceArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagInstance = async (logger: OperationLogLine, instanceArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag instance`);

  await getRDSClient().send(
    new RemoveTagsFromResourceCommand({
      ResourceName: instanceArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteInstance = async (logger: OperationLogLine, instanceName: string) => {
  logger.update(`Deleting instance`);

  try {
    const client = getRDSClient();

    await client.send(
      new DeleteDBInstanceCommand({
        DBInstanceIdentifier: instanceName,
        SkipFinalSnapshot: true
      })
    );

    await waitUntilDBInstanceDeleted(getRDSWaiter(client), {
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
