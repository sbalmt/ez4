import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const GroupServiceName = 'AWS:Log/Group';

export const GroupServiceType = 'aws:iam.policy';

export type GroupParameters = CreateRequest & {
  retention?: number;
};

export type GroupResult = CreateResponse;

export type GroupState = EntryState & {
  type: typeof GroupServiceType;
  parameters: GroupParameters;
  result?: GroupResult;
};
