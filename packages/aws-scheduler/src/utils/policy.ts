import type { PolicyDocument } from '@ez4/aws-identity';
import type { IdentityGrant } from '@ez4/project/library';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (resourcePrefix: string): Promise<PolicyDocument> => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const grants: IdentityGrant[] = [
    {
      resourceIds: [`arn:aws:lambda:${region}:${accountId}:function:${resourcePrefix}-*`],
      permissions: ['lambda:InvokeFunction']
    }
  ];

  return createPolicyDocument(grants);
};