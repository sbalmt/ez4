import type { RoleDocument } from '@ez4/aws-identity';

import { Logger } from '@ez4/aws-common';

import { S3Client, PutBucketPolicyCommand, DeleteBucketPolicyCommand } from '@aws-sdk/client-s3';

import { PolicyServiceName } from './types.js';

const client = new S3Client({});

export type CreateRequest = {
  bucketName: string;
  role: RoleDocument;
};

export type CreateResponse = {
  bucketName: string;
};

export const createPolicy = async (request: CreateRequest): Promise<CreateResponse> => {
  const { bucketName, role } = request;

  Logger.logCreate(PolicyServiceName, bucketName);

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

export const deletePolicy = async (bucketName: string) => {
  Logger.logDelete(PolicyServiceName, bucketName);

  await client.send(
    new DeleteBucketPolicyCommand({
      Bucket: bucketName
    })
  );
};
