import { getAwsClientOptions, getAwsClientWaiter } from '@ez4/aws-common';
import { LambdaClient } from '@aws-sdk/client-lambda';

export const getLambdaClient = () => {
  return new LambdaClient(getAwsClientOptions());
};

export const getLambdaWaiter = (client: LambdaClient) => {
  return {
    ...getAwsClientWaiter(),
    client
  };
};
