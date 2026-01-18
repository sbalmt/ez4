import { getAwsClientOptions, getAwsClientWaiter } from '@ez4/aws-common';
import { ACMClient } from '@aws-sdk/client-acm';

export const getACMClient = () => {
  return new ACMClient(getAwsClientOptions());
};

export const getACMWaiter = (client: ACMClient) => {
  return {
    ...getAwsClientWaiter(),
    client
  };
};
