import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { Event } from '@aws-sdk/client-s3';

import { PutBucketNotificationConfigurationCommand } from '@aws-sdk/client-s3';

import { getS3Client } from '../utils/deploy';

export type AttachRequest = {
  functionArn: Arn;
  events: Event[];
  path: string;
};

export type AttachResponse = {
  functionArns: Arn[];
};

export const attachEventNotifications = async (logger: OperationLogLine, bucketName: string, events: AttachRequest[]) => {
  logger.update(`Attaching bucket events`);

  await getS3Client().send(
    new PutBucketNotificationConfigurationCommand({
      Bucket: bucketName,
      SkipDestinationValidation: true,
      NotificationConfiguration: {
        LambdaFunctionConfigurations: events.map(({ functionArn, path, events }, index) => {
          const [prefix, suffix] = path.split('*', 2);

          return {
            Id: `ID${index}`,
            LambdaFunctionArn: functionArn,
            Events: events,
            Filter: {
              Key: {
                FilterRules: [
                  {
                    Name: 'prefix',
                    Value: prefix
                  },
                  {
                    Name: 'suffix',
                    Value: suffix
                  }
                ]
              }
            }
          };
        })
      }
    })
  );

  return {
    functionArns: events.map(({ functionArn }) => functionArn)
  };
};

export const detachEventNotifications = async (logger: OperationLogLine, bucketName: string) => {
  logger.update(`Detaching bucket events`);

  await getS3Client().send(
    new PutBucketNotificationConfigurationCommand({
      Bucket: bucketName,
      SkipDestinationValidation: true,
      NotificationConfiguration: {}
    })
  );
};
