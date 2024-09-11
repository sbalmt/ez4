import type { FunctionParameters as BaseFunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type TargetFunctionParameters = BaseFunctionParameters & {
  extras?: Record<string, ExtraSource>;
};
