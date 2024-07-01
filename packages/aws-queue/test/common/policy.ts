import type { PolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = (): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowQueueConsumer',
        Effect: 'Allow',
        Action: ['sqs:ReceiveMessage', 'sqs:GetQueueAttributes', 'sqs:DeleteMessage'],
        Resource: ['arn:aws:sqs:*:*:ez4-*']
      }
    ]
  };
};
