import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const GroupServiceName = 'AWS:Schedule/Group';

export const GroupServiceType = 'aws.schedule.group';

export type GroupParameters = CreateRequest;

export type GroupResult = CreateResponse;

export type GroupState = EntryState & {
  type: typeof GroupServiceType;
  parameters: GroupParameters;
  result?: GroupResult;
};
