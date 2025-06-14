import type { Arn } from '@ez4/aws-common';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const buildNotificationArn = (topicName: string, region: string, accountId: string) => {
  return `arn:aws:sns:${region}:${accountId}:${topicName}` as Arn;
};

export const getPolicyDocument = async (prefixList: string[]) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      permissions: ['sns:Publish'],
      resourceIds: prefixList.map((prefix) => {
        return buildNotificationArn(`${prefix}-*`, region, accountId);
      })
    }
  ]);
};
