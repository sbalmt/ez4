import type { FunctionParameters } from '@ez4/aws-function';
import type { CronEventSchema } from '@ez4/scheduler/library';
import type { ExtraSource } from '@ez4/project/library';

export type TargetFunction = {
  functionName: string;
  sourceFile: string;
};

export type TargetEntryPoint = TargetFunction & {
  dependencies: string[];
};

export type TargetFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle' | 'getFunctionFiles' | 'sourceFile' | 'handlerName'> & {
  handler: TargetEntryPoint;
  listener?: TargetFunction;
  eventSchema?: CronEventSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
