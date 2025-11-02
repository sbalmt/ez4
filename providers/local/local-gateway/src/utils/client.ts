import type { HttpImport, HttpPreferences, HttpService } from '@ez4/gateway/library';

export type ClientOperation = {
  preferences?: HttpPreferences;
  method: string;
  path: string;
};

export const buildClientOperations = (service: HttpService | HttpImport) => {
  const httpOperations: Record<string, ClientOperation> = {};

  const defaultPreferences = service.defaults?.preferences;

  for (const route of service.routes) {
    if (!route.name) {
      continue;
    }

    const [method, path] = route.path.split(' ', 2);

    httpOperations[route.name] = {
      preferences: route.preferences ?? defaultPreferences,
      method,
      path
    };
  }

  return httpOperations;
};
