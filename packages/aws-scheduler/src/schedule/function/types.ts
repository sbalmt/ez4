import type { FunctionParameters } from '@ez4/aws-function';
import type { CronEventSchema } from '@ez4/scheduler/library';
import type { ExtraSource } from '@ez4/project/library';

export type TargetEntryPoint = {
  functionName: string;
  sourceFile: string;
};

export type TargetFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionBundle' | 'sourceFile' | 'handlerName'
> & {
  handler: TargetEntryPoint;
  watcher?: TargetEntryPoint;
  eventSchema?: CronEventSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
