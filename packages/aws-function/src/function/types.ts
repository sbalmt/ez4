import type { EntryState, StepContext } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const FunctionServiceName = 'AWS:Lambda/Function';

export const FunctionServiceType = 'aws:lambda.function';

export type GetFunctionBundle = (context: StepContext) => Promise<string> | string;

export type GetFunctionFiles = () => [string, string[]];

export type FunctionParameters = Omit<CreateRequest, 'roleArn' | 'publish'> & {
  getFunctionBundle: GetFunctionBundle;
  getFunctionFiles: GetFunctionFiles;
};

export type FunctionResult = ImportOrCreateResponse & {
  logGroup?: string;
  sourceHash: string;
  roleArn: Arn;
};

export type FunctionState = EntryState & {
  type: typeof FunctionServiceType;
  parameters: FunctionParameters;
  result?: FunctionResult;
};
