import type { PolicyDocument } from '@ez4/aws-identity';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (prefixList: string[]): Promise<PolicyDocument> => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: prefixList.map((prefix) => {
        return `arn:aws:sqs:${region}:${accountId}:${prefix}-*`;
      }),
      permissions: [
        'sqs:SendMessage',
        'sqs:ReceiveMessage',
        'sqs:GetQueueAttributes',
        'sqs:DeleteMessage'
      ]
    }
  ]);
};
