import type { ResourceTags } from '@ez4/aws-common';

import { createReadStream } from 'node:fs';

import { S3Client, PutObjectCommand, PutObjectTaggingCommand, DeleteObjectCommand, NoSuchBucket } from '@aws-sdk/client-s3';
import { getTagList, Logger } from '@ez4/aws-common';

import mime from 'mime';

import { getBucketObjectPath } from './utils.js';
import { ObjectServiceName } from './types.js';

const client = new S3Client({});

export type CreateRequest = {
  filePath: string;
  objectKey: string;
};

export type CreateResponse = {
  objectKey: string;
};

export const putObject = async (bucketName: string, request: CreateRequest): Promise<CreateResponse> => {
  const { objectKey, filePath } = request;

  Logger.logCreate(ObjectServiceName, getBucketObjectPath(bucketName, objectKey));

  const contentType = mime.getType(filePath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: createReadStream(filePath),
      ...(contentType && {
        ContentType: contentType
      })
    })
  );

  return {
    objectKey
  };
};

export const tagObject = async (bucketName: string, objectKey: string, tags: ResourceTags) => {
  Logger.logTag(ObjectServiceName, getBucketObjectPath(bucketName, objectKey));

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
  Logger.logDelete(ObjectServiceName, getBucketObjectPath(bucketName, objectKey));

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NoSuchBucket)) {
      throw error;
    }

    return false;
  }
};
