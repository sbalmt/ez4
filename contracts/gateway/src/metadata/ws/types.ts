import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { FunctionSignature, ServiceArchitecture, ServiceListener, ServiceRuntime } from '@ez4/common/library';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { AuthHandler } from '../auth/types';

import { createServiceMetadata } from '@ez4/project/library';

export const WsServiceType = '@ez4/ws';

export const WsNamespaceType = 'Ws';

export type WsDataSchema = ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;

export type WsService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof WsServiceType;
    displayName?: string;
    stageName?: string;
    description?: string;
    defaults?: WsDefaults;
    schema: WsDataSchema;
    connect: WsConnection;
    disconnect: WsConnection;
    message: WsMessage;
  };

export type WsConnection = WsDefaults & {
  handler: WsHandler;
  authorizer?: AuthHandler;
  variables?: LinkedVariables;
};

export type WsMessage = WsDefaults & {
  handler: WsHandler;
  variables?: LinkedVariables;
};

export type WsHandler = FunctionSignature & {
  request?: WsRequest | WsEvent;
  response?: WsResponse;
};

export type WsEvent = {
  identity?: ObjectSchema | UnionSchema;
  headers?: ObjectSchema;
  query?: ObjectSchema;
  body?: WsDataSchema;
};

export type WsRequest = {
  identity?: ObjectSchema | UnionSchema;
  body?: WsDataSchema;
};

export type WsResponse = {
  body?: WsDataSchema;
};

export type WsPreferences = {
  namingStyle?: NamingStyle;
};

export type WsDefaults = {
  listener?: ServiceListener;
  preferences?: WsPreferences;
  architecture?: ServiceArchitecture;
  runtime?: ServiceRuntime;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export const isWsService = (service: ServiceMetadata): service is WsService => {
  return service.type === WsServiceType;
};

export const createWsService = (name: string) => {
  return {
    ...createServiceMetadata<WsService>(WsServiceType, name),
    variables: {},
    services: {}
  };
};
