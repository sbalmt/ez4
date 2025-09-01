import { getRandomName } from '../utils/names';

import { S3Client, CreateBucketCommand, GetObjectCommand, PutObjectCommand, NotFound, NoSuchKey } from '@aws-sdk/client-s3';

const s3Client = new S3Client();

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
  await s3Client.send(
    new CreateBucketCommand({
      Bucket: bucketName
    })
  );
};

const getStateBucketName = async () => {
  const randomName = await getRandomName(16);

  return `ez4-${randomName}`;
};
