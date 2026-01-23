import type { Arn, OperationLogLine, ResourceTags } from '@ez4/aws-common';
import type { Event } from '@aws-sdk/client-s3';
import type { Bucket } from '@ez4/storage';

import { getTagList } from '@ez4/aws-common';

import {
  ListObjectsV2Command,
  CreateBucketCommand,
  DeleteBucketCommand,
  PutBucketTaggingCommand,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketNotificationConfigurationCommand,
  DeleteBucketLifecycleCommand,
  DeleteBucketCorsCommand,
  ExpirationStatus,
  NoSuchBucket
} from '@aws-sdk/client-s3';

import { getS3Client } from '../utils/deploy';

export type CreateRequest = {
  bucketName: string;
};

export type CreateResponse = {
  bucketName: string;
};

export type UpdateNotificationRequest = {
  functionArn?: Arn;
  eventsPath?: string;
  eventsType: Event[];
};

export const isBucketEmpty = async (logger: OperationLogLine, bucketName: string) => {
  logger.update(`Fetching bucket`);

  try {
    const response = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1
      })
    );

    return !response.Contents?.length;
  } catch (error) {
    if (!(error instanceof NoSuchBucket)) {
      throw error;
    }

    return 0;
  }
};

export const createBucket = async (logger: OperationLogLine, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating bucket`);

  const { bucketName } = request;

  await getS3Client().send(
    new CreateBucketCommand({
      Bucket: bucketName
    })
  );

  return {
    bucketName
  };
};

export const deleteBucket = async (logger: OperationLogLine, bucketName: string) => {
  logger.update(`Deleting bucket`);

  try {
    await getS3Client().send(
      new DeleteBucketCommand({
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

export const tagBucket = async (logger: OperationLogLine, bucketName: string, tags: ResourceTags) => {
  logger.update(`Tag bucket`);

  await getS3Client().send(
    new PutBucketTaggingCommand({
      Bucket: bucketName,
      Tagging: {
        TagSet: getTagList({
          ...tags,
          ManagedBy: 'EZ4'
        })
      }
    })
  );
};

export const updateCorsConfiguration = async (logger: OperationLogLine, bucketName: string, cors: Bucket.Cors) => {
  logger.update(`Updating bucket CORS`);

  await getS3Client().send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            ID: 'ID0',
            AllowedOrigins: cors.allowOrigins,
            AllowedMethods: cors.allowMethods,
            AllowedHeaders: cors.allowHeaders,
            ExposeHeaders: cors.exposeHeaders,
            MaxAgeSeconds: cors.maxAge
          }
        ]
      }
    })
  );
};

export const deleteCorsConfiguration = async (logger: OperationLogLine, bucketName: string) => {
  logger.update(`Deleting bucket CORS`);

  try {
    await getS3Client().send(
      new DeleteBucketCorsCommand({
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

export const createLifecycle = async (logger: OperationLogLine, bucketName: string, autoExpireDays: number) => {
  logger.update(`Creating bucket lifecycle`);

  await getS3Client().send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'ID0',
            Status: ExpirationStatus.Enabled,
            Filter: {
              Prefix: '*'
            },
            Expiration: {
              Days: autoExpireDays
            }
          }
        ]
      }
    })
  );
};

export const deleteLifecycle = async (logger: OperationLogLine, bucketName: string) => {
  logger.update(`Deleting bucket lifecycle`);

  try {
    await getS3Client().send(
      new DeleteBucketLifecycleCommand({
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

export const updateEventNotifications = async (logger: OperationLogLine, bucketName: string, request: UpdateNotificationRequest) => {
  logger.update(`Update bucket event stream`);

  const { functionArn, eventsPath, eventsType } = request;

  await getS3Client().send(
    new PutBucketNotificationConfigurationCommand({
      Bucket: bucketName,
      SkipDestinationValidation: true,
      NotificationConfiguration: {
        ...(functionArn && {
          LambdaFunctionConfigurations: [
            {
              Id: 'ID0',
              LambdaFunctionArn: functionArn,
              Events: eventsType,
              ...(eventsPath && {
                Filter: {
                  Key: {
                    FilterRules: [
                      {
                        Name: 'prefix',
                        Value: eventsPath
                      }
                    ]
                  }
                }
              })
            }
          ]
        })
      }
    })
  );
};
