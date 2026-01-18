import { IAMClient } from '@aws-sdk/client-iam';

export const getIAMClient = () => {
  return new IAMClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
