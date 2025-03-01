import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = async (prefix: string) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: [`arn:aws:lambda:${region}:${accountId}:function:${prefix}-*`],
      permissions: ['lambda:InvokeFunction']
    }
  ]);
};
