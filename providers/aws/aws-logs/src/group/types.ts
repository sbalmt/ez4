import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const LogGroupServiceName = 'AWS:Log/Group';

export const LogGroupServiceType = 'aws:log.group';

export type LogGroupParameters = CreateRequest & {
  retention?: number;
};

export type LogGroupResult = CreateResponse;

export type LogGroupState = EntryState & {
  type: typeof LogGroupServiceType;
  parameters: LogGroupParameters;
  result?: LogGroupResult;
};
