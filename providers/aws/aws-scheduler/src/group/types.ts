import type { EntryState } from '@ez4/state';
import type { CreateRequest, CreateResponse } from './client';

export const GroupServiceName = 'AWS:Schedule/Group';

export const GroupServiceType = 'aws.schedule.group';

export type GroupParameters = CreateRequest;

export type GroupResult = CreateResponse;

export type GroupState = EntryState & {
  type: typeof GroupServiceType;
  parameters: GroupParameters;
  result?: GroupResult;
};
