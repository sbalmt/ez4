import type { RoleDocument } from '@ez4/aws-identity';

export const getRoleDocument = (): RoleDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowAssumeRole',
        Effect: 'Allow',
        Action: 'sts:AssumeRole',
        Principal: {
          Service: ['lambda.amazonaws.com', 'scheduler.amazonaws.com']
        }
      }
    ]
  };
};
