import type { Arn } from '@ez4/aws-common';

export const buildGatewayArn = (region: string, accountId: string, apiId: string, method: string): Arn => {
  return `arn:aws:execute-api:${region}:${accountId}:${apiId}/*/${method}/@connections/{connectionId}`;
};
