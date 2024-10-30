import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type TargetFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle'> & {
  extras?: Record<string, ExtraSource>;
};
