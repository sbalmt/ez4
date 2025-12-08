import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { AuthHandler } from '../auth/types';

export const WsServiceType = '@ez4/ws';

export const WsNamespaceType = 'Ws';

export const isWsService = (service: ServiceMetadata): service is WsService => {
  return service.type === WsServiceType;
};

export type WsDataSchema = ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;

export type WsService = ServiceMetadata & {
  type: typeof WsServiceType;
  displayName?: string;
  description?: string;
  defaults?: WsDefaults;
  routeKey: string;
  schema: WsDataSchema;
  connect: WsConnection;
  disconnect: WsConnection;
  message: WsMessage;
};

export type WsConnection = {
  handler: WsHandler;
  listener?: ServiceListener;
  authorizer?: AuthHandler;
  variables?: LinkedVariables;
  preferences?: WsPreferences;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type WsMessage = {
  handler: WsHandler;
  listener?: ServiceListener;
  variables?: LinkedVariables;
  preferences?: WsPreferences;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type WsHandler = {
  name: string;
  file: string;
  module?: string;
  description?: string;
  request?: WsRequest | WsEvent;
  response?: WsResponse;
};

export type WsRequest = {
  identity?: ObjectSchema | UnionSchema;
  headers?: ObjectSchema;
  parameters?: ObjectSchema;
  query?: ObjectSchema;
  body?: WsDataSchema;
};

export type WsEvent = {
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
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type WsCache = {
  authorizerTTL?: number;
};
