import type { IdentityGrant } from '@ez4/project/library';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (prefix: string, useStreams: boolean) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const grants: IdentityGrant[] = [
    {
      resourceIds: [`arn:aws:dynamodb:${region}:${accountId}:table/${prefix}-*`],
      permissions: ['dynamodb:PartiQLInsert', 'dynamodb:PartiQLSelect', 'dynamodb:PartiQLUpdate', 'dynamodb:PartiQLDelete']
    }
  ];

  if (useStreams) {
    grants.push({
      resourceIds: [`arn:aws:dynamodb:${region}:${accountId}:table/${prefix}-*/stream/*`],
      permissions: ['dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:DescribeStream', 'dynamodb:ListStreams']
    });
  }

  return createPolicyDocument(grants);
};
