import { ApiGatewayV2Client } from '@aws-sdk/client-apigatewayv2';

export const getApiGatewayV2Client = () => {
  return new ApiGatewayV2Client({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
