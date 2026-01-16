import type { Logger, ResourceTags } from '@ez4/aws-common';

import { createReadStream } from 'node:fs';

import { S3Client, PutObjectCommand, PutObjectTaggingCommand, DeleteObjectCommand, NoSuchBucket } from '@aws-sdk/client-s3';
import { getTagList } from '@ez4/aws-common';

import mime from 'mime';

const client = new S3Client({});

export type CreateRequest = {
  filePath: string;
  objectKey: string;
};

export type CreateResponse = {
  objectKey: string;
};

export const putObject = async (logger: Logger.OperationLogger, bucketName: string, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating object`);

  const { objectKey, filePath } = request;

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

export const updateTags = async (logger: Logger.OperationLogger, bucketName: string, objectKey: string, tags: ResourceTags) => {
  logger.update(`Updating object tags`);

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

export const deleteObject = async (logger: Logger.OperationLogger, bucketName: string, objectKey: string) => {
  logger.update(`Deleting object`);

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
