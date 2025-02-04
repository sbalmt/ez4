import type { PolicyDocument } from '@ez4/aws-identity';
import type { Arn } from '@ez4/aws-common';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const buildNotificationArn = (queueName: string, region: string, accountId: string) => {
  return `arn:aws:sns:${region}:${accountId}:${queueName}` as Arn;
};

export const getPolicyDocument = async (prefixList: string[]): Promise<PolicyDocument> => {
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
