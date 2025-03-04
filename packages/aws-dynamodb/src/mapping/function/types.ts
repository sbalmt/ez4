import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type StreamEntryPoint = {
  functionName: string;
  sourceFile: string;
};

export type StreamFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionBundle' | 'sourceFile' | 'handlerName'
> & {
  handler: StreamEntryPoint;
  listener?: StreamEntryPoint;
  tableSchema?: ObjectSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
