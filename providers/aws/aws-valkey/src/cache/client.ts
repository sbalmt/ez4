import type { Arn, OperationLogLine, ResourceTags } from '@ez4/aws-common';

import {
  CreateServerlessCacheCommand,
  DescribeServerlessCachesCommand,
  DeleteServerlessCacheCommand,
  AddTagsToResourceCommand,
  RemoveTagsFromResourceCommand,
  ServerlessCacheNotFoundFault
} from '@aws-sdk/client-elasticache';

import { getTagList } from '@ez4/aws-common';

import { getCacheClient } from '../utils/deploy';
import { waitForServerlessCache } from './helpers/waiter';

export type CreateRequest = {
  name: string;
  description?: string;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  cacheArn: Arn;
  readerEndpoint: string;
  writerEndpoint: string;
};

export const importCache = async (logger: OperationLogLine | undefined, cacheName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger?.update(`Importing cache`);

  try {
    const response = await getCacheClient().send(
      new DescribeServerlessCachesCommand({
        ServerlessCacheName: cacheName
      })
    );

    if (!response.ServerlessCaches?.length) {
      return undefined;
    }

    const { ARN, Endpoint, ReaderEndpoint } = response.ServerlessCaches[0];

    return {
      cacheArn: ARN as Arn,
      readerEndpoint: ReaderEndpoint?.Address!,
      writerEndpoint: Endpoint?.Address!
    };
  } catch (error) {
    if (!(error instanceof ServerlessCacheNotFoundFault)) {
      throw error;
    }

    return undefined;
  }
};

export const createCache = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating cache`);

  const { name, description } = request;

  const client = getCacheClient();

  await client.send(
    new CreateServerlessCacheCommand({
      ServerlessCacheName: name,
      Description: description,
      MajorEngineVersion: '8',
      Engine: 'valkey',
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  await waitForServerlessCache(client, name);

  const response = await getCacheClient().send(
    new DescribeServerlessCachesCommand({
      ServerlessCacheName: name
    })
  );

  const { ARN, Endpoint, ReaderEndpoint } = response.ServerlessCaches?.[0]!;

  return {
    cacheArn: ARN as Arn,
    readerEndpoint: ReaderEndpoint?.Address!,
    writerEndpoint: Endpoint?.Address!
  };
};

export const tagCache = async (logger: OperationLogLine, cacheArn: string, tags: ResourceTags) => {
  logger.update(`Tag cache`);

  await getCacheClient().send(
    new AddTagsToResourceCommand({
      ResourceName: cacheArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagCache = async (logger: OperationLogLine, cacheArn: string, tagKeys: string[]) => {
  logger.update(`Untag cache`);

  await getCacheClient().send(
    new RemoveTagsFromResourceCommand({
      ResourceName: cacheArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteCache = async (logger: OperationLogLine, cacheName: string) => {
  logger.update(`Delete cache`);

  const client = getCacheClient();

  try {
    await client.send(
      new DeleteServerlessCacheCommand({
        ServerlessCacheName: cacheName
      })
    );

    await waitForServerlessCache(client, cacheName);
  } catch (error) {
    if (!(error instanceof ServerlessCacheNotFoundFault)) {
      throw error;
    }
  }
};
