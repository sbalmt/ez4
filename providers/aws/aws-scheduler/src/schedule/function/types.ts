import type { FunctionParameters, FunctionVariables } from '@ez4/aws-function';
import type { CronEventSchema } from '@ez4/scheduler/library';
import type { ContextSource } from '@ez4/project/library';

export type TargetFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type TargetEntryPoint = TargetFunction & {
  dependencies: string[];
};

export type TargetFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'getFunctionVariables' | 'sourceFile' | 'handlerName'
> & {
  handler: TargetEntryPoint;
  listener?: TargetFunction;
  eventSchema?: CronEventSchema;
  context?: Record<string, ContextSource>;
  variables: (FunctionVariables | undefined)[];
  debug?: boolean;
};
