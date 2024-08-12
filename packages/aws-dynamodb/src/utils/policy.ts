import type { PolicyDocument } from '@ez4/aws-identity';
import type { IdentityGrant } from '@ez4/project';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (
  resourcePrefix: string,
  hasStreams: boolean
): Promise<PolicyDocument> => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const grants: IdentityGrant[] = [
    {
      resourceIds: [`arn:aws:dynamodb:${region}:${accountId}:table/${resourcePrefix}-*`],
      permissions: [
        'dynamodb:PartiQLInsert',
        'dynamodb:PartiQLSelect',
        'dynamodb:PartiQLUpdate',
        'dynamodb:PartiQLDelete'
      ]
    }
  ];

  if (hasStreams) {
    grants.push({
      resourceIds: [`arn:aws:dynamodb:${region}:${accountId}:table/${resourcePrefix}-*/stream/*`],
      permissions: [
        'dynamodb:GetRecords',
        'dynamodb:GetShardIterator',
        'dynamodb:DescribeStream',
        'dynamodb:ListStreams'
      ]
    });
  }

  return createPolicyDocument(grants);
};
