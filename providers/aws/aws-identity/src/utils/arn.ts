import type { Arn } from '@ez4/aws-common';

export const buildRoleArn = (accountId: string, roleName: string): Arn => {
  return `arn:aws:iam::${accountId}:role/${roleName}`;
};
