import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type StreamFunction = {
  functionName: string;
  sourceFile: string;
};

export type StreamEntryPoint = StreamFunction & {
  dependencies: string[];
};

export type StreamFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle' | 'getFunctionFiles' | 'sourceFile' | 'handlerName'> & {
  handler: StreamEntryPoint;
  listener?: StreamFunction;
  tableSchema?: ObjectSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
