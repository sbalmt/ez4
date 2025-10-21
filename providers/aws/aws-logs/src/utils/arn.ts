import type { Arn } from '@ez4/aws-common';

export const buildLogGroupArn = (region: string, accountId: string, groupName: string): Arn => {
  return `arn:aws:logs:${region}:${accountId}:log-group:${groupName}`;
};
