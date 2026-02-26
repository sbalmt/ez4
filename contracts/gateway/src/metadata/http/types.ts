import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { LinkedServices, LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
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

export type HttpHandler = FunctionSignature & {
  provider?: HttpProvider;
  response: HttpResponse;
  request?: HttpRequest;
  isolated?: boolean;
};

export type HttpErrors = {
  [name: string]: number;
};

export type HttpRoute = HttpDefaults & {
  name?: string;
  path: HttpPath;
  handler: HttpHandler;
  authorizer?: AuthHandler;
  variables?: LinkedVariables;
  disabled?: boolean;
  cors?: boolean;
  vpc?: boolean;
};

export type HttpDefaults = {
  listener?: ServiceListener;
  httpErrors?: HttpErrors;
  preferences?: HttpPreferences;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  logLevel?: LogLevel;
  timeout?: number;
  memory?: number;
  files?: string[];
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
