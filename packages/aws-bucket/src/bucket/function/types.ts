import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type BucketEventEntryPoint = {
  functionName: string;
  sourceFile: string;
};

export type BucketEventFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionBundle' | 'sourceFile' | 'handlerName'
> & {
  handler: BucketEventEntryPoint;
  watcher?: BucketEventEntryPoint;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
