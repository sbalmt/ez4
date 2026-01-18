import { SQSClient } from '@aws-sdk/client-sqs';

export const getSQSClient = () => {
  return new SQSClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
