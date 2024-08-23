import type { PolicyDocument, PolicyStatement } from '@ez4/aws-identity';
import type { IdentityGrant } from '@ez4/project/library';

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
