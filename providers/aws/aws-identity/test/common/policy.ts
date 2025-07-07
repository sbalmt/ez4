import type { PolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = (sid?: string): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: sid ?? 'AllowLogGroups',
        Effect: 'Allow',
        Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        Resource: ['arn:aws:logs:*:*:log-group:/aws/lambda/ez4-*:*']
      }
    ]
  };
};
