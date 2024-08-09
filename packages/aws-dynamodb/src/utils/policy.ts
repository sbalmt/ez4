import type { PolicyDocument } from '@ez4/aws-identity';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (resourcePrefix: string): Promise<PolicyDocument> => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: [`arn:aws:dynamodb:${region}:${accountId}:table/${resourcePrefix}-*`],
      permissions: [
        'dynamodb:PartiQLInsert',
        'dynamodb:PartiQLSelect',
        'dynamodb:PartiQLUpdate',
        'dynamodb:PartiQLDelete'
      ]
    }
  ]);
};
