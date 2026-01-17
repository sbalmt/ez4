import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const StageServiceName = 'AWS:API/Stage';

export const StageServiceType = 'aws:api.stage';

export type StageParameters = Omit<CreateRequest, 'stageName' | 'access'> & {
  stageName: string;
};

export type StageResult = ImportOrCreateResponse & {
  logGroupArn?: Arn;
  apiId: string;
};

export type StageState = EntryState & {
  type: typeof StageServiceType;
  parameters: StageParameters;
  result?: StageResult;
};
