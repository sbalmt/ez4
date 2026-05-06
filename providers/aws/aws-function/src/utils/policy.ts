import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (prefix: string) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      permissions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
      resourceIds: [`arn:aws:logs:${region}:${accountId}:log-group:${prefix}-*:*`]
    },
    {
      permissions: ['ec2:CreateNetworkInterface', 'ec2:DescribeNetworkInterfaces', 'ec2:DeleteNetworkInterface'],
      resourceIds: ['*']
    }
  ]);
};
