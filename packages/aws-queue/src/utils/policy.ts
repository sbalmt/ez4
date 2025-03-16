import type { Arn } from '@ez4/aws-common';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const buildQueueArn = (region: string, accountId: string, queueName: string) => {
  return `arn:aws:sqs:${region}:${accountId}:${queueName}` as Arn;
};

export const getPolicyDocument = async (prefixList: string[]) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: prefixList.map((prefix) => {
        return buildQueueArn(region, accountId, `${prefix}-*`);
      }),
      permissions: ['sqs:SendMessage', 'sqs:ReceiveMessage', 'sqs:GetQueueAttributes', 'sqs:DeleteMessage']
    }
  ]);
};
