import { ApiGatewayV2Client } from '@aws-sdk/client-apigatewayv2';
import { getAwsClientOptions } from '@ez4/aws-common';

export const getApiGatewayV2Client = () => {
  return new ApiGatewayV2Client(getAwsClientOptions());
};
