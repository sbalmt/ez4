import type { FunctionParameters } from '@ez4/aws-function';
import type { ContextSource } from '@ez4/project/library';

export type BucketEventFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type BucketEventEntryPoint = BucketEventFunction & {
  dependencies: string[];
};

export type BucketEventFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'sourceFile' | 'handlerName'
> & {
  handler: BucketEventEntryPoint;
  listener?: BucketEventFunction;
  context?: Record<string, ContextSource>;
  debug?: boolean;
};
