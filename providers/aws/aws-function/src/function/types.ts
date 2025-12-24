import type { EntryState, StepContext } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
import type { Arn } from '@ez4/aws-common';
import type { FunctionVariables } from '../types/variables';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const FunctionServiceName = 'AWS:Lambda/Function';

export const FunctionServiceType = 'aws:lambda.function';

export type GetFunctionFiles = () => [string, string[]];
export type GetFunctionVariables = () => Promise<LinkedVariables> | LinkedVariables;
export type GetFunctionBundle = (context: StepContext) => Promise<string> | string;
export type GetFunctionHash = () => Promise<string | undefined> | string | undefined;

export type FunctionParameters = Omit<CreateRequest, 'roleArn' | 'publish' | 'variables'> & {
  getFunctionFiles: GetFunctionFiles;
  getFunctionVariables: GetFunctionVariables;
  getFunctionBundle: GetFunctionBundle;
  getFunctionHash: GetFunctionHash;
};

export type FunctionResult = ImportOrCreateResponse & {
  variables: FunctionVariables;
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
