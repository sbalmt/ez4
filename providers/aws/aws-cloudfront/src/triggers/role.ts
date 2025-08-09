import type { RoleDocument } from '@ez4/aws-identity';

import { createRoleDocument, createRoleStatement } from '@ez4/aws-identity';

export const getRoleDocument = (distributionArn: string, bucketName: string): RoleDocument => {
  return createRoleDocument([
    createRoleStatement(
      {
        permissions: ['s3:ListBucket', 's3:GetObject'],
        resourceIds: [`arn:aws:s3:::${bucketName}`, `arn:aws:s3:::${bucketName}/*`]
      },
      [
        {
          account: 'cloudfront.amazonaws.com'
        }
      ],
      distributionArn
    )
  ]);
};
