import { getAwsClientOptions } from '@ez4/aws-common';
import { SQSClient } from '@aws-sdk/client-sqs';

export const getSQSClient = () => {
  return new SQSClient(getAwsClientOptions());
};
