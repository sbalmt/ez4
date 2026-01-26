import { getAwsClientOptions, getAwsClientWaiter } from '@ez4/aws-common';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';

export const getCloudFrontClient = () => {
  return new CloudFrontClient(getAwsClientOptions());
};

export const getCloudFrontWaiter = (client: CloudFrontClient) => {
  return {
    ...getAwsClientWaiter(),
    client
  };
};
