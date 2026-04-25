import type { ContextSource, LinkedVariables } from '@ez4/project/library';
import type { FunctionParameters } from '@ez4/aws-function';

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
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'getFunctionVariables' | 'sourceFile' | 'handlerName'
> & {
  handler: BucketEventEntryPoint;
  listener?: BucketEventFunction;
  context?: Record<string, ContextSource>;
  variables: (LinkedVariables | undefined)[];
  debug?: boolean;
};
