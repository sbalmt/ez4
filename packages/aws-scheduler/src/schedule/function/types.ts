import type { FunctionParameters } from '@ez4/aws-function';
import type { CronEventSchema } from '@ez4/scheduler/library';
import type { ExtraSource } from '@ez4/project/library';

export type TargetFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle'> & {
  eventSchema?: CronEventSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
