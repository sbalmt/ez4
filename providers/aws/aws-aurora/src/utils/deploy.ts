import { RDSClient } from '@aws-sdk/client-rds';

export const getRDSClient = () => {
  return new RDSClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};

export const getRDSWaiter = (client: RDSClient) => {
  return {
    minDelay: 15,
    maxWaitTime: 1800,
    maxDelay: 60,
    client
  };
};
