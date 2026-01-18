import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { getAwsClientOptions } from '@ez4/aws-common';

export const getCloudFrontClient = () => {
  return new CloudFrontClient(getAwsClientOptions());
};

export const getCloudFrontWaiter = (client: CloudFrontClient) => {
  return {
    minDelay: 30,
    maxWaitTime: 3600,
    maxDelay: 120,
    client
  };
};
