import type { Arn } from '@ez4/aws-common';

import { createPolicyDocument } from '@ez4/aws-identity';

export const buildBucketArn = (bucketName: string) => {
  return `arn:aws:s3:::${bucketName}` as Arn;
};

export const getPolicyDocument = (prefix: string) => {
  return createPolicyDocument([
    {
      resourceIds: [`arn:aws:s3:::${prefix}-*`, `arn:aws:s3:::${prefix}-*/*`],
      permissions: ['s3:ListBucket', 's3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:HeadObject']
    }
  ]);
};
