import type { ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  PutBucketTaggingCommand,
  PutBucketLifecycleConfigurationCommand,
  DeleteBucketLifecycleCommand,
  ExpirationStatus,
  S3Client
} from '@aws-sdk/client-s3';

import { BucketServiceName } from './types.js';

const client = new S3Client({});

export type CreateRequest = {
  bucketName: string;
};

export type CreateResponse = {
  bucketName: string;
};

export const createBucket = async (request: CreateRequest): Promise<CreateResponse> => {
  const { bucketName } = request;

  Logger.logCreate(BucketServiceName, bucketName);

  await client.send(
    new CreateBucketCommand({
      Bucket: bucketName
    })
  );

  return {
    bucketName
  };
};

export const tagBucket = async (bucketName: string, tags: ResourceTags) => {
  Logger.logTag(BucketServiceName, bucketName);

  await client.send(
    new PutBucketTaggingCommand({
      Bucket: bucketName,
      Tagging: {
        TagSet: getTagList({
          ...tags,
          ManagedBy: 'EZ4'
        })
      }
    })
  );
};

export const createLifecycle = async (bucketName: string, autoExpireDays: number) => {
  Logger.logCreate(BucketServiceName, `${bucketName} lifecycle`);

  await client.send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'ID0',
            Status: ExpirationStatus.Enabled,
            Filter: {
              Prefix: '*'
            },
            Expiration: {
              Days: autoExpireDays
            }
          }
        ]
      }
    })
  );
};

export const deleteLifecycle = async (bucketName: string) => {
  Logger.logDelete(BucketServiceName, `${bucketName} lifecycle`);

  await client.send(
    new DeleteBucketLifecycleCommand({
      Bucket: bucketName
    })
  );
};

export const deleteBucket = async (bucketName: string) => {
  Logger.logDelete(BucketServiceName, bucketName);

  await client.send(
    new DeleteBucketCommand({
      Bucket: bucketName
    })
  );
};
