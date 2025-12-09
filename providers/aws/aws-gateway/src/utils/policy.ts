import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';
import { buildGatewayArn } from './arn';

export const getPolicyDocument = async () => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: [buildGatewayArn(region, accountId, '*', 'POST'), buildGatewayArn(region, accountId, '*', 'DELETE')],
      permissions: ['execute-api:ManageConnections']
    }
  ]);
};
