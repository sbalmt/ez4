import type { PolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = (): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowTopicPublisher',
        Effect: 'Allow',
        Action: ['sns:Publish'],
        Resource: ['arn:aws:sns:*:*:ez4-*']
      }
    ]
  };
};
