import { getAwsClientOptions } from '@ez4/aws-common';
import { ACMClient } from '@aws-sdk/client-acm';

export const getACMClient = () => {
  return new ACMClient(getAwsClientOptions());
};

export const getACMWaiter = (client: ACMClient) => {
  return {
    minDelay: 15,
    maxWaitTime: 3600,
    maxDelay: 90,
    client
  };
};
