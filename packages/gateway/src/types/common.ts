import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';

export type HttpVerb = 'ANY' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type HttpPath = `${HttpVerb} /${string}`;

export type HttpAuthRequest = {
  headers?: ObjectSchema | null;
  parameters?: ObjectSchema | null;
  query?: ObjectSchema | null;
};

export type HttpAuthResponse = {
  identity?: ObjectSchema | UnionSchema | null;
};

export type HttpRequest = {
  headers?: ObjectSchema | null;
  identity?: ObjectSchema | UnionSchema | null;
  parameters?: ObjectSchema | null;
  query?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | ArraySchema | null;
};

export type HttpResponse = {
  status: number;
  headers?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
};

export type HttpHandler = {
  name: string;
  file: string;
  description?: string;
  response: HttpResponse;
  request?: HttpRequest;
};

export type HttpAuthorizer = {
  name: string;
  file: string;
  description?: string;
  response?: HttpAuthResponse;
  request?: HttpAuthRequest;
};

export type HttpRoute = {
  path: HttpPath;
  listener?: ServiceListener;
  authorizer?: HttpAuthorizer;
  handler: HttpHandler;
  variables?: LinkedVariables | null;
  retention?: number;
  timeout?: number;
  memory?: number;
  cors?: boolean;
};

export type HttpDefaults = {
  retention?: number | null;
  listener?: ServiceListener | null;
  timeout?: number | null;
  memory?: number | null;
};

export type HttpCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};

export type HttpCache = {
  authorizerTTL?: number;
};
