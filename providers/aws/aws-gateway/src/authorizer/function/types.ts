import type { ContextSource, LinkedServices } from '@ez4/project/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { HttpPreferences } from '@ez4/gateway/library';
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
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'sourceFile' | 'handlerName'
> & {
  authorizer: AuthorizerEntryPoint;
  listener?: AuthorizerFunction;
  preferences?: HttpPreferences;
  headersSchema?: ObjectSchema;
  parametersSchema?: ObjectSchema;
  querySchema?: ObjectSchema;
  context?: Record<string, ContextSource>;
  services?: LinkedServices;
  debug?: boolean;
};
