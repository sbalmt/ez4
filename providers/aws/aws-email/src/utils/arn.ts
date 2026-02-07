import type { Arn } from '@ez4/aws-common';

export const buildIdentityArn = (region: string, accountId: string, identity: string): Arn => {
  return `arn:aws:ses:${region}:${accountId}:identity/${identity}`;
};
