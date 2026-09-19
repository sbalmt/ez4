import {
  S3Client,
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  BucketAlreadyOwnedByYou,
  NoSuchKey,
  NotFound
} from '@aws-sdk/client-s3';

import { getAwsClientOptions } from '../utils/clients';
import { getRandomName } from '../utils/names';

const s3Client = new S3Client(getAwsClientOptions());

export const loadStateFile = async (filePath: string) => {
  const bucketName = await getStateBucketName();

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
  const bucketName = await getStateBucketName();

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
  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: bucketName
      })
    );
  } catch (error) {
    if (!(error instanceof BucketAlreadyOwnedByYou)) {
      throw error;
    }
  }
};

const getStateBucketName = async () => {
  const randomName = await getRandomName(16);

  return `ez4-${randomName}`;
};
