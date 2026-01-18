import { LambdaClient } from '@aws-sdk/client-lambda';

export const getLambdaClient = () => {
  return new LambdaClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};

export const getLambdaWaiter = (client: LambdaClient) => {
  return {
    minDelay: 10,
    maxWaitTime: 1800,
    maxDelay: 30,
    client
  };
};
