import { S3Client } from '@aws-sdk/client-s3';

export const getS3Client = () => {
  return new S3Client({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
