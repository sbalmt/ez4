import type { Arn } from '@ez4/aws-common';

import { getAccountId, getRegion } from '@ez4/aws-identity';

export const getGroupArn = async (groupName: string) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const groupArn = `arn:aws:logs:${region}:${accountId}:log-group:${groupName}`;

  return groupArn as Arn;
};
