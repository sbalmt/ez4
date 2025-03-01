import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (resourcePrefix: string) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      permissions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resourceIds: [
        `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${resourcePrefix}-*:*`
      ]
    }
  ]);
};
