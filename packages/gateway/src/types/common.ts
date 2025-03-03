import type { LinkedVariables } from '@ez4/project/library';

import type {
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  UnionSchema
} from '@ez4/schema';

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
  body?: ObjectSchema | UnionSchema | null;
};

export type HttpResponse = {
  status: number;
  headers?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | NumberSchema | StringSchema | BooleanSchema | null;
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

export type HttpCatcher = {
  name: string;
  file: string;
  description?: string;
};

export type HttpRoute = {
  path: HttpPath;
  handler: HttpHandler;
  authorizer?: HttpAuthorizer;
  catcher?: HttpCatcher;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
  cors?: boolean;
};

export type HttpDefaults = {
  catcher?: HttpCatcher;
  timeout?: number;
  memory?: number;
};

export type HttpCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};
