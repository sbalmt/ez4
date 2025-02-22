import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import {
  S3Client,
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  NotFound,
  NoSuchKey
} from '@aws-sdk/client-s3';

import { hash } from 'node:crypto';

const stsClient = new STSClient();
const s3Client = new S3Client();

export const loadStateFile = async (filePath: string) => {
  const bucketName = await getBucketName();

  await ensureBucketExists(bucketName);

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: filePath
      })
    );

    const content = await response.Body!.transformToByteArray();

    return Buffer.from(content);
  } catch (error) {
    if (!(error instanceof NotFound) && !(error instanceof NoSuchKey)) {
      throw error;
    }

    return null;
  }
};

export const saveStateFile = async (filePath: string, contents: string) => {
  const bucketName = await getBucketName();

  await ensureBucketExists(bucketName);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      ContentType: 'application/json',
      Body: contents,
      Key: filePath
    })
  );
};

const ensureBucketExists = async (bucketName: string) => {
  await s3Client.send(
    new CreateBucketCommand({
      Bucket: bucketName
    })
  );
};

const getBucketName = async () => {
  const response = await stsClient.send(new GetCallerIdentityCommand());
  const bucketName = hash('sha256', response.Account!).substring(0, 16);

  return `ez4-${bucketName}`;
};
