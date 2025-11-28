import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { LinkedServices, LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { AuthorizationType } from '../common/authorization';

export type HttpVerb = 'ANY' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type HttpPath = `${HttpVerb} /${string}`;

export type HttpPreferences = {
  namingStyle?: NamingStyle;
};

export type HttpAuthorization = {
  type: AuthorizationType;
  header: string;
  value: string;
};

export type HttpAuthRequest = {
  headers?: ObjectSchema;
  parameters?: ObjectSchema;
  query?: ObjectSchema;
};

export type HttpAuthResponse = {
  identity?: ObjectSchema | UnionSchema;
};

export type HttpRequest = {
  identity?: ObjectSchema | UnionSchema;
  headers?: ObjectSchema;
  parameters?: ObjectSchema;
  query?: ObjectSchema;
  body?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
};

export type HttpResponse = {
  status: number | number[];
  headers?: ObjectSchema;
  body?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
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

export type HttpAuthorizer = {
  name: string;
  module?: string;
  file: string;
  description?: string;
  response?: HttpAuthResponse;
  request?: HttpAuthRequest;
};

export type HttpErrors = {
  [name: string]: number;
};

export type HttpRoute = {
  name?: string;
  path: HttpPath;
  handler: HttpHandler;
  listener?: ServiceListener;
  authorizer?: HttpAuthorizer;
  variables?: LinkedVariables;
  httpErrors?: HttpErrors;
  preferences?: HttpPreferences;
  logRetention?: number;
  timeout?: number;
  memory?: number;
  cors?: boolean;
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
