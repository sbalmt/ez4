import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { HttpImport, HttpService, HttpRoute } from '../metadata/http/types';

import { getObjectSchemaProperty } from '@ez4/schema';

import { isHttpImport } from '../metadata/http/types';

export type ClientOperation = {
  namingStyle?: NamingStyle;
  bodySchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  querySchema?: ObjectSchema;
  authorize?: boolean;
  method: string;
  path: string;
};

export const getClientOperations = (service: HttpService | HttpImport) => {
  const allOperations: Record<string, ClientOperation> = {};

  const defaultNamingStyle = service.defaults?.preferences?.namingStyle;
  const authorizationHeader = isHttpImport(service) ? service.authorization?.header : undefined;

  for (const route of service.routes) {
    if (!route.name) {
      continue;
    }

    const [method, path] = route.path.split(' ', 2);

    const { handler, preferences } = route;

    allOperations[route.name] = {
      authorize: shouldUseAuthorization(route, authorizationHeader),
      namingStyle: preferences?.namingStyle ?? defaultNamingStyle,
      bodySchema: handler.request?.body,
      responseSchema: handler.response.body,
      querySchema: handler.request?.query,
      method,
      path
    };
  }

  return allOperations;
};

const shouldUseAuthorization = (route: HttpRoute, authorizationHeader: string | undefined) => {
  const headersSchema = route.authorizer?.request?.headers;

  if (!headersSchema || !authorizationHeader) {
    return false;
  }

  const authorizationSchema = getObjectSchemaProperty(headersSchema, authorizationHeader);

  if (!authorizationSchema || authorizationSchema.optional) {
    return false;
  }

  return true;
};
