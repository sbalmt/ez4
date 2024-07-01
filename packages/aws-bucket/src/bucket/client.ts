import type { ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  PutBucketTaggingCommand,
  S3Client
} from '@aws-sdk/client-s3';

import { BucketServiceName } from './types.js';

const client = new S3Client({});

export type CreateRequest = {
  bucketName: string;
};

export type CreateResponse = {
  bucketName: string;
  location: string;
};

export const createBucket = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(BucketServiceName, request.bucketName);

  const response = await client.send(
    new CreateBucketCommand({
      Bucket: request.bucketName
    })
  );

  return {
    bucketName: request.bucketName,
    location: response.Location!
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

export const deleteBucket = async (bucketName: string) => {
  Logger.logDelete(BucketServiceName, bucketName);

  await client.send(
    new DeleteBucketCommand({
      Bucket: bucketName
    })
  );
};
