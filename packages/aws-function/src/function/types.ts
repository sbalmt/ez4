import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const FunctionServiceName = 'AWS:Lambda/Function';

export const FunctionServiceType = 'aws:lambda.function';

type GetFunctionBundle = (context: StepContext) => Promise<string> | string;

export type FunctionParameters = Omit<CreateRequest, 'roleArn'> & {
  getFunctionBundle: GetFunctionBundle;
};

export type FunctionResult = ImportOrCreateResponse & {
  sourceHash: string;
  roleArn: Arn;
};

export type FunctionState = EntryState & {
  type: typeof FunctionServiceType;
  parameters: FunctionParameters;
  result?: FunctionResult;
};
