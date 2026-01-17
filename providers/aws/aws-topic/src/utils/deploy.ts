import { SNSClient } from '@aws-sdk/client-sns';

export const getSNSClient = () => {
  return new SNSClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
