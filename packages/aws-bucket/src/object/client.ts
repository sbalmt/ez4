import type { ResourceTags } from '@ez4/aws-common';

import { createReadStream } from 'node:fs';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client
} from '@aws-sdk/client-s3';

import { ObjectServiceName } from './types.js';
import { getObjectPath } from './utils.js';

const client = new S3Client({});

export type CreateRequest = {
  filePath: string;
  objectKey: string;
  expires?: Date;
};

export type CreateResponse = {
  objectKey: string;
  etag: string;
};

export const putObject = async (
  bucketName: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  Logger.logCreate(ObjectServiceName, getObjectPath(bucketName, request.objectKey));

  const response = await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: request.objectKey,
      Body: createReadStream(request.filePath),
      Expires: request.expires
    })
  );

  return {
    objectKey: request.objectKey,
    etag: response.ETag!
  };
};

export const tagObject = async (bucketName: string, objectKey: string, tags: ResourceTags) => {
  Logger.logTag(ObjectServiceName, getObjectPath(bucketName, objectKey));

  await client.send(
    new PutObjectTaggingCommand({
      Bucket: bucketName,
      Key: objectKey,
      Tagging: {
        TagSet: getTagList({
          ...tags,
          ManagedBy: 'EZ4'
        })
      }
    })
  );
};

export const deleteObject = async (bucketName: string, objectKey: string) => {
  Logger.logDelete(ObjectServiceName, getObjectPath(bucketName, objectKey));

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey
    })
  );
};
