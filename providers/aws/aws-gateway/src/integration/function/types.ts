import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { HttpPreferences } from '@ez4/gateway/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource, LinkedServices } from '@ez4/project/library';

export type IntegrationFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type IntegrationEntryPoint = IntegrationFunction & {
  dependencies: string[];
};

export type IntegrationFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'sourceFile' | 'handlerName'
> & {
  handler: IntegrationEntryPoint;
  listener?: IntegrationFunction | null;
  preferences?: HttpPreferences;
  headersSchema?: ObjectSchema | null;
  identitySchema?: ObjectSchema | UnionSchema | null;
  parametersSchema?: ObjectSchema | null;
  querySchema?: ObjectSchema | null;
  bodySchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
  errorsMap?: Record<string, number> | null;
  extras?: Record<string, ExtraSource>;
  services?: LinkedServices | null;
  debug?: boolean;
};
