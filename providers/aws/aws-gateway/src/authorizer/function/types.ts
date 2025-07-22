import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type AuthorizerFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type AuthorizerEntryPoint = AuthorizerFunction & {
  dependencies: string[];
};

export type AuthorizerFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionBundle' | 'getFunctionFiles' | 'sourceFile' | 'handlerName'
> & {
  authorizer: AuthorizerEntryPoint;
  listener?: AuthorizerFunction;
  headersSchema?: ObjectSchema | null;
  parametersSchema?: ObjectSchema | null;
  querySchema?: ObjectSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
