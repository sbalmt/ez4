import type { FunctionParameters } from '@ez4/aws-function';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { ExtraSource } from '@ez4/project/library';

export type IntegrationFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle'> & {
  responseSchema?: ObjectSchema | UnionSchema | null;
  headersSchema?: ObjectSchema | null;
  identitySchema?: ObjectSchema | UnionSchema | null;
  parametersSchema?: ObjectSchema | null;
  querySchema?: ObjectSchema | null;
  bodySchema?: ObjectSchema | UnionSchema | null;
  extras?: Record<string, ExtraSource>;
};
