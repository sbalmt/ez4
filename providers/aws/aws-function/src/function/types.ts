import type { EntryState, StepContext } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const FunctionServiceName = 'AWS:Lambda/Function';

export const FunctionServiceType = 'aws:lambda.function';

export type GetFunctionFiles = () => [string, string[]];
export type GetFunctionBundle = (context: StepContext) => Promise<string> | string;
export type GetFunctionHash = () => Promise<string | undefined> | string | undefined;

export type FunctionParameters = Omit<CreateRequest, 'roleArn' | 'publish'> & {
  getFunctionFiles: GetFunctionFiles;
  getFunctionBundle: GetFunctionBundle;
  getFunctionHash: GetFunctionHash;
};

export type FunctionResult = ImportOrCreateResponse & {
  valuesHash?: string;
  sourceHash: string;
  bundleHash: string;
  logGroup?: string;
  roleArn: Arn;
};

export type FunctionState = EntryState & {
  type: typeof FunctionServiceType;
  parameters: FunctionParameters;
  result?: FunctionResult;
};
