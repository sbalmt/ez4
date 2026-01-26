import { getAwsClientOptions } from '@ez4/aws-common';
import { SNSClient } from '@aws-sdk/client-sns';

export const getSNSClient = () => {
  return new SNSClient(getAwsClientOptions());
};
