import type { ContextSource, LinkedVariables } from '@ez4/project/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ObjectSchema } from '@ez4/schema';

export type StreamFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type StreamEntryPoint = StreamFunction & {
  dependencies: string[];
};

export type StreamFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'getFunctionVariables' | 'sourceFile' | 'handlerName'
> & {
  handler: StreamEntryPoint;
  listener?: StreamFunction;
  tableSchema?: ObjectSchema;
  context?: Record<string, ContextSource>;
  variables: (LinkedVariables | undefined)[];
  debug?: boolean;
};
