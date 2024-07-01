import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const StageServiceName = 'AWS:API/Stage';

export const StageServiceType = 'aws:api.stage';

export type StageParameters = Omit<CreateRequest, 'stageName'> & {
  stageName?: string;
};

export type StageResult = CreateResponse & {
  apiId: string;
};

export type StageState = EntryState & {
  type: typeof StageServiceType;
  parameters: StageParameters;
  result?: StageResult;
};
