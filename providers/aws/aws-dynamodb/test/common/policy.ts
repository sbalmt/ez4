import type { PolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = (): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowTableStreamConsumer',
        Effect: 'Allow',
        Resource: ['arn:aws:dynamodb:*:*:table/ez4-*/stream/*'],
        Action: ['dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:DescribeStream', 'dynamodb:ListStreams']
      }
    ]
  };
};
