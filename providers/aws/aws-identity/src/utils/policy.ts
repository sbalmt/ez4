import type { IdentityGrant } from '@ez4/project/library';
import type { Arn } from '@ez4/aws-common';
import type { PolicyDocument, PolicyStatement } from '../types/policy.js';

import { getAccountId } from './account.js';

export const createPolicyDocument = (grants: IdentityGrant[]): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: grants.map((current, index): PolicyStatement => {
      return {
        Sid: `ID${index}`,
        Effect: 'Allow',
        Resource: current.resourceIds,
        Action: current.permissions
      };
    })
  };
};

export const getPolicyArn = async (policyName: string) => {
  const accountId = await getAccountId();

  const policyArn = `arn:aws:iam::${accountId}:policy/${policyName}`;

  return policyArn as Arn;
};
