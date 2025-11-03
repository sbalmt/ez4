import type { FunctionParameters } from '@ez4/aws-function';
import type { ContextSource } from '@ez4/project/library';
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
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'sourceFile' | 'handlerName'
> & {
  handler: StreamEntryPoint;
  listener?: StreamFunction;
  tableSchema?: ObjectSchema;
  context?: Record<string, ContextSource>;
  debug?: boolean;
};
