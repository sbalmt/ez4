import { LambdaClient } from '@aws-sdk/client-lambda';
import { getAwsClientOptions } from '@ez4/aws-common';

export const getLambdaClient = () => {
  return new LambdaClient(getAwsClientOptions());
};

export const getLambdaWaiter = (client: LambdaClient) => {
  return {
    minDelay: 5,
    maxWaitTime: 1800,
    maxDelay: 15,
    client
  };
};
