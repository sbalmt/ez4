import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';

export const getCloudWatchLogsClient = () => {
  return new CloudWatchLogsClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
