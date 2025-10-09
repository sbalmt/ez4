import type { Arn } from '@ez4/aws-common';

export const buildQueueArn = (region: string, accountId: string, queueName: string): Arn => {
  return `arn:aws:sqs:${region}:${accountId}:${queueName}`;
};
