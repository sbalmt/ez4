import type { RoleDocument } from '@ez4/aws-identity';
import type { Logger } from '@ez4/project/library';

import { S3Client, PutBucketPolicyCommand, DeleteBucketPolicyCommand, NoSuchBucket } from '@aws-sdk/client-s3';

const client = new S3Client({});

export type CreateRequest = {
  bucketName: string;
  role: RoleDocument;
};

export type CreateResponse = {
  bucketName: string;
};

export const createPolicy = async (logger: Logger.LogLine, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating bucket policy`);

  const { bucketName, role } = request;

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(role)
    })
  );

  return {
    bucketName
  };
};

export const deletePolicy = async (bucketName: string, logger: Logger.LogLine) => {
  logger.update(`Deleting bucket policy`);

  try {
    await client.send(
      new DeleteBucketPolicyCommand({
        Bucket: bucketName
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
