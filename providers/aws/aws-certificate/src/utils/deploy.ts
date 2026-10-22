import { getAwsClientOptions, getAwsClientWaiter } from '@ez4/aws-common';
import { ACMClient } from '@aws-sdk/client-acm';

/**
 * CloudFront, the only consumer of this provider, accepts certificates from us-east-1 alone.
 * The certificate lives there whatever the region of the deploy.
 */
const CertificateRegion = 'us-east-1';

export const getACMClient = () => {
  return new ACMClient({
    ...getAwsClientOptions(),
    region: CertificateRegion
  });
};

export const getACMWaiter = (client: ACMClient) => {
  return {
    ...getAwsClientWaiter(),
    client
  };
};
