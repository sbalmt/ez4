import { CloudFrontClient } from '@aws-sdk/client-cloudfront';

export const getCloudFrontClient = () => {
  return new CloudFrontClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};

export const getCloudFrontWaiter = (client: CloudFrontClient) => {
  return {
    minDelay: 30,
    maxWaitTime: 3600,
    maxDelay: 120,
    client
  };
};
