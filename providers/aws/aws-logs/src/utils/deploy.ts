import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { getAwsClientOptions } from '@ez4/aws-common';

export const getCloudWatchLogsClient = () => {
  return new CloudWatchLogsClient(getAwsClientOptions());
};
