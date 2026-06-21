import type { ObjectSchema } from '@ez4/schema';
import type { HttpService } from '@ez4/gateway/library';

import { getWithNamingStyle, SchemaType } from '@ez4/schema';
import { ManifestActionType } from '@ez4/project/library';

const METHOD_ACTION_TYPES: Record<string, ManifestActionType> = {
  HEAD: ManifestActionType.Head,
  GET: ManifestActionType.Get,
  POST: ManifestActionType.Post,
  DELETE: ManifestActionType.Delete,
  PATCH: ManifestActionType.Patch,
  PUT: ManifestActionType.Put
};

export namespace HttpManifest {
  export const build = (service: HttpService) => {
    const { defaults, routes } = service;

    const defaultNamingStyle = defaults?.preferences?.namingStyle;

    return {
      actions: routes.map(({ path, handler, authorizer, preferences }) => {
        const { description, provider, request, response } = handler;

        const namingStyle = preferences?.namingStyle ?? defaultNamingStyle;

        const combinedHeaders = combineSchema(request?.headers, authorizer?.request?.headers);
        const combinedQuery = combineSchema(request?.query, authorizer?.request?.query);

        const [method, endpoint] = path.split(' ', 2);

        return {
          path: endpoint,
          type: METHOD_ACTION_TYPES[method] ?? ManifestActionType.None,
          group: provider?.name,
          name: handler.name,
          description,
          request: {
            identity: request?.identity,
            headers: combinedHeaders,
            parameters: request?.parameters,
            query: combinedQuery && getWithNamingStyle(combinedQuery, namingStyle),
            body: request?.body && getWithNamingStyle(request.body, namingStyle)
          },
          response: {
            headers: response.headers,
            body: response.body && getWithNamingStyle(response.body, namingStyle)
          }
        };
      })
    };
  };

  const combineSchema = (...schemas: (ObjectSchema | undefined)[]): ObjectSchema | undefined => {
    if (schemas.every((schema) => !schema)) {
      return undefined;
    }

    return {
      type: SchemaType.Object,
      properties: schemas.reduce((properties, schema) => {
        if (schema) {
          Object.assign(properties, schema.properties);
        }

        return properties;
      }, {})
    };
  };
}
