import type { Arn } from '@ez4/aws-common';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const buildQueueArn = (queueName: string, region: string, accountId: string) => {
  return `arn:aws:sqs:${region}:${accountId}:${queueName}` as Arn;
};

export const queueUrlToArn = (queueUrl: string) => {
  const [domain, accountId, queueName] = queueUrl.substring(8).split('/', 3);
  const [, region] = domain.split('.', 3);

  return buildQueueArn(queueName, region, accountId);
};

export const getPolicyDocument = async (prefixList: string[]) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: prefixList.map((prefix) => {
        return buildQueueArn(`${prefix}-*`, region, accountId);
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
