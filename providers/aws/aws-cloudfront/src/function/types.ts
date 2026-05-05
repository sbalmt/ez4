import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const FunctionServiceName = 'AWS:CloudFront/Function';

export const FunctionServiceType = 'aws:cloudfront.function';

export type GetFunctionBundle = (context: StepContext) => Promise<string> | string;
export type GetFunctionHash = () => Promise<string | undefined> | string | undefined;

export type FunctionParameters = Omit<CreateRequest, 'functionCode'> & {
  getFunctionBundle: GetFunctionBundle;
  getFunctionHash: GetFunctionHash;
};

export type FunctionResult = ImportOrCreateResponse & {
  valuesHash?: string;
};

export type FunctionState = EntryState & {
  type: typeof FunctionServiceType;
  parameters: FunctionParameters;
  result?: FunctionResult;
};
