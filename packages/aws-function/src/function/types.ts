import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, CreateResponse } from './client.js';

export const FunctionServiceName = 'AWS:Lambda/Function';

export const FunctionServiceType = 'aws:lambda.function';

export type FunctionParameters = Omit<CreateRequest, 'roleArn'>;

export type FunctionResult = CreateResponse & {
  sourceTime: number;
  sourceHash: string;
  roleArn: Arn;
};

export type FunctionState = EntryState & {
  type: typeof FunctionServiceType;
  parameters: FunctionParameters;
  result?: FunctionResult;
};
