import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';
import { buildQueueArn } from './arn';

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
