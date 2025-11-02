import type { ArraySchema, NamingStyle, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { HttpImport, HttpService } from '@ez4/gateway/library';

export type ClientOperation = {
  namingStyle?: NamingStyle;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
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
      responseSchema: route.handler.response.body,
      method,
      path
    };
  }

  return allOperations;
};
