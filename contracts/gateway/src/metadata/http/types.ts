import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { LinkedServices, LinkedVariables } from '@ez4/project/library';
import type { ServiceMetadata } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { AuthorizationType } from '../../services/http/authorization';
import type { HttpPath } from '../../services/http/path';
import type { AuthHandler } from '../auth/types';

import { createServiceMetadata } from '@ez4/project/library';

export const HttpServiceType = '@ez4/http';

export const HttpImportType = '@ez4/import:http';

export const HttpNamespaceType = 'Http';

export type HttpDataSchema = ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;

export type HttpService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof HttpServiceType;
    displayName?: string;
    description?: string;
    defaults?: HttpDefaults;
    routes: HttpRoute[];
    cache?: HttpCache;
    access?: HttpAccess;
    cors?: HttpCors;
  };

export type HttpImport = ServiceMetadata & {
  type: typeof HttpImportType;
  reference: string;
  project: string;
  displayName?: string;
  description?: string;
  defaults?: HttpDefaults;
  authorization?: HttpAuthorization;
  routes: HttpRoute[];
};

export type HttpPreferences = {
  namingStyle?: NamingStyle;
};

export type HttpAuthorization = {
  type: AuthorizationType;
  header: string;
  value: string;
};

export type HttpRequest = {
  identity?: ObjectSchema | UnionSchema;
  headers?: ObjectSchema;
  parameters?: ObjectSchema;
  query?: ObjectSchema;
  body?: HttpDataSchema;
};

export type HttpResponse = {
  status: number | number[];
  headers?: ObjectSchema;
  body?: HttpDataSchema;
};

export type HttpHandler = {
  name: string;
  file: string;
  module?: string;
  description?: string;
  response: HttpResponse;
  request?: HttpRequest;
  provider?: HttpProvider;
};

export type HttpErrors = {
  [name: string]: number;
};

export type HttpRoute = {
  name?: string;
  path: HttpPath;
  handler: HttpHandler;
  listener?: ServiceListener;
  authorizer?: AuthHandler;
  variables?: LinkedVariables;
  httpErrors?: HttpErrors;
  preferences?: HttpPreferences;
  logRetention?: number;
  timeout?: number;
  memory?: number;
  cors?: boolean;
  disabled?: boolean;
};

export type HttpDefaults = {
  listener?: ServiceListener;
  httpErrors?: HttpErrors;
  preferences?: HttpPreferences;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type HttpCache = {
  authorizerTTL?: number;
};

export type HttpAccess = {
  logRetention: number;
};

export type HttpCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};

export type HttpProvider = {
  variables?: LinkedVariables;
  services?: LinkedServices;
};

export const isHttpService = (service: ServiceMetadata): service is HttpService => {
  return service.type === HttpServiceType;
};

export const createHttpService = (name: string) => {
  return {
    ...createServiceMetadata<HttpService>(HttpServiceType, name),
    variables: {},
    services: {}
  };
};

export const isHttpImport = (service: ServiceMetadata): service is HttpImport => {
  return service.type === HttpImportType;
};

export const createHttpImport = (name: string) => {
  return createServiceMetadata<HttpImport>(HttpImportType, name);
};
