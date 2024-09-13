import type { PolicyDocument } from '@ez4/aws-identity';

import { createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = (prefix: string): PolicyDocument => {
  return createPolicyDocument([
    {
      resourceIds: [`arn:aws:s3:::${prefix}-*`, `arn:aws:s3:::${prefix}-*/*`],
      permissions: ['s3:ListBucket', 's3:PutObject', 's3:GetObject', 's3:DeleteObject']
    }
  ]);
};
