import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { LinkedServices, LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';

export type HttpVerb = 'ANY' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type HttpPath = `${HttpVerb} /${string}`;

export type HttpPreferences = {
  namingStyle?: NamingStyle;
};

export type HttpAuthRequest = {
  headers?: ObjectSchema | null;
  parameters?: ObjectSchema | null;
  query?: ObjectSchema | null;
};

export type HttpAuthResponse = {
  identity?: ObjectSchema | UnionSchema | null;
};

export type HttpRequest = {
  identity?: ObjectSchema | UnionSchema | null;
  headers?: ObjectSchema | null;
  parameters?: ObjectSchema | null;
  query?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
};

export type HttpResponse = {
  status: number | number[];
  headers?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
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
  path: HttpPath;
  handler: HttpHandler;
  listener?: ServiceListener | null;
  authorizer?: HttpAuthorizer | null;
  variables?: LinkedVariables | null;
  httpErrors?: HttpErrors | null;
  preferences?: HttpPreferences;
  logRetention?: number | null;
  timeout?: number | null;
  memory?: number | null;
  cors?: boolean | null;
};

export type HttpDefaults = {
  listener?: ServiceListener | null;
  httpErrors?: HttpErrors | null;
  preferences?: HttpPreferences;
  logRetention?: number | null;
  timeout?: number | null;
  memory?: number | null;
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
  variables?: LinkedVariables | null;
  services?: LinkedServices | null;
};
