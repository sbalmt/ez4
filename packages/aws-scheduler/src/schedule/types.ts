import type { Arn } from '@ez4/aws-common';
import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const ScheduleServiceName = 'AWS:EventBridge/Schedule';

export const ScheduleServiceType = 'aws:eventbridge.schedule';

export type ScheduleParameters = Omit<CreateRequest, 'roleArn' | 'functionArn' | 'groupName'>;

export type ScheduleResult = CreateResponse & {
  groupName?: string;
  functionArn: Arn;
  roleArn: Arn;
};

export type ScheduleState = EntryState & {
  type: typeof ScheduleServiceType;
  parameters: ScheduleParameters;
  result?: ScheduleResult;
};
