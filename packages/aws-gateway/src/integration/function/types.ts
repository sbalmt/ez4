import type { FunctionParameters } from '@ez4/aws-function';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { ExtraSource } from '@ez4/project/library';

export type IntegrationFunctionParameters = FunctionParameters & {
  headersSchema?: ObjectSchema | null;
  identitySchema?: ObjectSchema | null;
  parametersSchema?: ObjectSchema | null;
  querySchema?: ObjectSchema | null;
  bodySchema?: ObjectSchema | UnionSchema | null;
  extras?: Record<string, ExtraSource>;
};
