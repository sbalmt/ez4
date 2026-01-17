import { SchedulerClient } from '@aws-sdk/client-scheduler';

export const getSchedulerClient = () => {
  return new SchedulerClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};
