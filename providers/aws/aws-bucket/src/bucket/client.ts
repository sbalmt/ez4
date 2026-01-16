import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';
import type { Event } from '@aws-sdk/client-s3';
import type { Bucket } from '@ez4/storage';

import { getTagList } from '@ez4/aws-common';

import {
  S3Client,
  ListObjectsV2Command,
  CreateBucketCommand,
  DeleteBucketCommand,
  PutBucketTaggingCommand,
  PutBucketCorsCommand,
  DeleteBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  DeleteBucketLifecycleCommand,
  PutBucketNotificationConfigurationCommand,
  ExpirationStatus,
  NoSuchBucket
} from '@aws-sdk/client-s3';

const client = new S3Client({});

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

export const isBucketEmpty = async (logger: Logger.OperationLogger, bucketName: string) => {
  logger.update(`Fetching bucket`);

  try {
    const response = await client.send(
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

export const createBucket = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating bucket`);

  const { bucketName } = request;

  await client.send(
    new CreateBucketCommand({
      Bucket: bucketName
    })
  );

  return {
    bucketName
  };
};

export const deleteBucket = async (logger: Logger.OperationLogger, bucketName: string) => {
  logger.update(`Deleting bucket`);

  try {
    await client.send(
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

export const tagBucket = async (logger: Logger.OperationLogger, bucketName: string, tags: ResourceTags) => {
  logger.update(`Tag bucket`);

  await client.send(
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

export const updateCorsConfiguration = async (logger: Logger.OperationLogger, bucketName: string, cors: Bucket.Cors) => {
  logger.update(`Updating bucket CORS`);

  await client.send(
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

export const deleteCorsConfiguration = async (logger: Logger.OperationLogger, bucketName: string) => {
  logger.update(`Deleting bucket CORS`);

  try {
    await client.send(
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

export const createLifecycle = async (logger: Logger.OperationLogger, bucketName: string, autoExpireDays: number) => {
  logger.update(`Creating bucket lifecycle`);

  await client.send(
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

export const deleteLifecycle = async (logger: Logger.OperationLogger, bucketName: string) => {
  logger.update(`Deleting bucket lifecycle`);

  try {
    await client.send(
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

export const updateEventNotifications = async (logger: Logger.OperationLogger, bucketName: string, request: UpdateNotificationRequest) => {
  logger.update(`Update bucket event stream`);

  const { functionArn, eventsPath, eventsType } = request;

  await client.send(
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
