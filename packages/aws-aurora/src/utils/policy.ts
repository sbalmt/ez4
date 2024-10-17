import type { PolicyDocument } from '@ez4/aws-identity';
import type { IdentityGrant } from '@ez4/project/library';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (prefix: string): Promise<PolicyDocument> => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const grants: IdentityGrant[] = [
    {
      resourceIds: [`arn:aws:secretsmanager:${region}:${accountId}:secret:rds!*`],
      permissions: ['secretsmanager:GetSecretValue']
    },
    {
      resourceIds: [`arn:aws:rds:${region}:${accountId}:cluster:${prefix}-*`],
      permissions: [
        'rds-data:BeginTransaction',
        'rds-data:CommitTransaction',
        'rds-data:ExecuteStatement',
        'rds-data:RollbackTransaction'
      ]
    }
  ];

  return createPolicyDocument(grants);
};
