import type { RoleDocument } from '@ez4/aws-identity';

import { createRoleDocument } from '@ez4/aws-identity';

export const getRoleDocument = (distributionArn: string, bucketName: string): RoleDocument => {
  return createRoleDocument(
    {
      permissions: ['s3:GetObject'],
      resourceIds: [`arn:aws:s3:::${bucketName}/*`]
    },
    [
      {
        account: 'cloudfront.amazonaws.com'
      }
    ],
    distributionArn
  );
};
