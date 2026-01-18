import { SchedulerClient } from '@aws-sdk/client-scheduler';
import { getAwsClientOptions } from '@ez4/aws-common';

export const getSchedulerClient = () => {
  return new SchedulerClient(getAwsClientOptions());
};
