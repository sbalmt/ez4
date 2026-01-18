import { getAwsClientOptions } from '@ez4/aws-common';
import { IAMClient } from '@aws-sdk/client-iam';

export const getIAMClient = () => {
  return new IAMClient(getAwsClientOptions());
};
