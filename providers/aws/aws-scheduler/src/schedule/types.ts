import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, CreateResponse } from './client';

export const ScheduleServiceName = 'AWS:EventBridge/Schedule';

export const ScheduleServiceType = 'aws:eventbridge.schedule';

export type ScheduleParameters = Omit<CreateRequest, 'roleArn' | 'functionArn' | 'groupName'> & {
  dynamic: boolean;
};

export type ScheduleResult = Partial<CreateResponse> & {
  groupName?: string;
  functionArn: Arn;
  roleArn: Arn;
};

export type ScheduleState = EntryState & {
  type: typeof ScheduleServiceType;
  parameters: ScheduleParameters;
  result?: ScheduleResult;
};
