import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

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
  'getFunctionBundle' | 'getFunctionFiles' | 'sourceFile' | 'handlerName'
> & {
  handler: BucketEventEntryPoint;
  listener?: BucketEventFunction;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
