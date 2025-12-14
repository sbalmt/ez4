import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { ContextSource, LinkedServices } from '@ez4/project/library';
import type { HttpPreferences } from '@ez4/gateway/library';
import type { FunctionParameters } from '@ez4/aws-function';

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
  type: IntegrationFunctionType;
  handler: IntegrationEntryPoint;
  listener?: IntegrationFunction;
  preferences?: HttpPreferences;
  headersSchema?: ObjectSchema;
  identitySchema?: ObjectSchema | UnionSchema;
  parametersSchema?: ObjectSchema;
  querySchema?: ObjectSchema;
  bodySchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  errorsMap?: Record<string, number>;
  context?: Record<string, ContextSource>;
  services?: LinkedServices;
  debug?: boolean;
};

export const enum IntegrationFunctionType {
  HttpRequest = 'http-request',
  WsConnection = 'ws-connection',
  WsMessage = 'ws-message'
}
