import type { ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type IntegrationEntryPoint = {
  functionName: string;
  sourceFile: string;
};

export type IntegrationFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionBundle' | 'sourceFile' | 'handlerName'
> & {
  handler: IntegrationEntryPoint;
  listener?: IntegrationEntryPoint;
  responseSchema?: ObjectSchema | UnionSchema | ScalarSchema | null;
  headersSchema?: ObjectSchema | null;
  identitySchema?: ObjectSchema | UnionSchema | null;
  parametersSchema?: ObjectSchema | null;
  querySchema?: ObjectSchema | null;
  bodySchema?: ObjectSchema | UnionSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
