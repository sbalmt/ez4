import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type AuthorizerFunctionParameters = FunctionParameters & {
  headersSchema?: ObjectSchema | null;
  parametersSchema?: ObjectSchema | null;
  querySchema?: ObjectSchema | null;
  extras?: Record<string, ExtraSource>;
};
