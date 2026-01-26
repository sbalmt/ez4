import type { RoleDocument } from '@ez4/aws-identity';
import type { OperationLogLine } from '@ez4/aws-common';

import { PutBucketPolicyCommand, DeleteBucketPolicyCommand, NoSuchBucket } from '@aws-sdk/client-s3';

import { getS3Client } from '../utils/deploy';

const client = getS3Client();

export type CreateRequest = {
  bucketName: string;
  role: RoleDocument;
};

export type CreateResponse = {
  bucketName: string;
};

export const createPolicy = async (logger: OperationLogLine, request: CreateRequest): Promise<CreateResponse> => {
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

export const deletePolicy = async (logger: OperationLogLine, bucketName: string) => {
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
