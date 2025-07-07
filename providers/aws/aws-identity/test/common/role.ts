import type { RoleDocument } from '@ez4/aws-identity';

export const getRoleDocument = (sid?: string): RoleDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: sid ?? 'AllowAssumeRole',
        Effect: 'Allow',
        Action: 'sts:AssumeRole',
        Principal: {
          Service: ['lambda.amazonaws.com']
        }
      }
    ]
  };
};
