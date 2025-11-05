import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { HttpImport, HttpService } from '@ez4/gateway/library';

export type ClientOperation = {
  namingStyle?: NamingStyle;
  bodySchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  querySchema?: ObjectSchema;
  method: string;
  path: string;
};

export const getClientOperations = (service: HttpService | HttpImport) => {
  const allOperations: Record<string, ClientOperation> = {};

  const defaultNamingStyle = service.defaults?.preferences?.namingStyle;

  for (const route of service.routes) {
    if (!route.name) {
      continue;
    }

    const [method, path] = route.path.split(' ', 2);

    allOperations[route.name] = {
      namingStyle: route.preferences?.namingStyle ?? defaultNamingStyle,
      bodySchema: route.handler.request?.body,
      responseSchema: route.handler.response.body,
      querySchema: route.handler.request?.query,
      method,
      path
    };
  }

  return allOperations;
};
