import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { ServiceListener } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpAuthorizer, HttpHandler } from '../../types/common';

const ServiceType = '@ez4/ws';

export type WsEventSchema = ObjectSchema | UnionSchema;

export type WsService = ServiceMetadata & {
  type: typeof ServiceType;
  displayName?: string;
  description?: string;
  schema: WsEventSchema;
  connect: WsConnect;
  disconnect: WsTrigger;
  data: WsTrigger;
};

export type WsConnect = {
  handler: HttpHandler;
  listener?: ServiceListener;
  authorizer?: HttpAuthorizer;
  variables?: LinkedVariables;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type WsTrigger = {
  handler: WsHandler;
  listener?: ServiceListener;
  variables?: LinkedVariables;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type WsHandler = {
  name: string;
  file: string;
  module?: string;
  description?: string;
};

export const isWsService = (service: ServiceMetadata): service is WsService => {
  return service.type === ServiceType;
};

export const isCompleteWsService = (type: Incomplete<WsService>): type is WsService => {
  return !!type.name && !!type.schema && !!type.connect && !!type.disconnect && !!type.data && !!type.context;
};

export const getPartialWsService = (): Incomplete<WsService> => {
  return { type: ServiceType, context: {} };
};
