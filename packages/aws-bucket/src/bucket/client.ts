import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { Bucket } from '@ez4/storage';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  S3Client,
  ExpirationStatus,
  Event,
  ListObjectsV2Command,
  CreateBucketCommand,
  DeleteBucketCommand,
  PutBucketTaggingCommand,
  PutBucketCorsCommand,
  DeleteBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  DeleteBucketLifecycleCommand,
  PutBucketNotificationConfigurationCommand
} from '@aws-sdk/client-s3';

import { BucketServiceName } from './types.js';

const client = new S3Client({});

export type CreateRequest = {
  bucketName: string;
  notification?: Notification;
};

export type CreateResponse = {
  bucketName: string;
};

export const isBucketEmpty = async (bucketName: string) => {
  Logger.logFetch(BucketServiceName, bucketName);

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1
    })
  );

  return !response.Contents?.length;
};

export const createBucket = async (request: CreateRequest): Promise<CreateResponse> => {
  const { bucketName } = request;

  Logger.logCreate(BucketServiceName, bucketName);

  await client.send(
    new CreateBucketCommand({
      Bucket: bucketName
    })
  );

  return {
    bucketName
  };
};

export const deleteBucket = async (bucketName: string) => {
  Logger.logDelete(BucketServiceName, bucketName);

  await client.send(
    new DeleteBucketCommand({
      Bucket: bucketName
    })
  );
};

export const tagBucket = async (bucketName: string, tags: ResourceTags) => {
  Logger.logTag(BucketServiceName, bucketName);

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

export const updateCorsConfiguration = async (bucketName: string, cors: Bucket.Cors) => {
  Logger.logUpdate(BucketServiceName, `${bucketName} CORS`);

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

export const deleteCorsConfiguration = async (bucketName: string) => {
  Logger.logDelete(BucketServiceName, `${bucketName} CORS`);

  await client.send(
    new DeleteBucketCorsCommand({
      Bucket: bucketName
    })
  );
};

export const createLifecycle = async (bucketName: string, autoExpireDays: number) => {
  Logger.logCreate(BucketServiceName, `${bucketName} lifecycle`);

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

export const deleteLifecycle = async (bucketName: string) => {
  Logger.logDelete(BucketServiceName, `${bucketName} lifecycle`);

  await client.send(
    new DeleteBucketLifecycleCommand({
      Bucket: bucketName
    })
  );
};

export const updateEventNotifications = async (
  bucketName: string,
  functionArn: Arn | undefined,
  events: Event[]
) => {
  Logger.logUpdate(BucketServiceName, `${bucketName} event notifications`);

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
              Events: events
            }
          ]
        })
      }
    })
  );
};
