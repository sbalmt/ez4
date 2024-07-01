import type { FunctionParameters as BaseFunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project';
import type { AnySchema } from '@ez4/schema';

export const FunctionServiceName = 'AWS:API/Function';

export type FunctionParameters = BaseFunctionParameters & {
  querySchema?: AnySchema | null;
  parametersSchema?: AnySchema | null;
  bodySchema?: AnySchema | null;
  extras?: Record<string, ExtraSource>;
};
