import type { HttpService } from '@ez4/gateway/library';

import { ManifestActionType } from '@ez4/project/library';
import { SchemaType } from '@ez4/schema';

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
    return {
      actions: service.routes.map(({ path, handler, authorizer }) => {
        const { request, response, description } = handler;

        const [method, endpoint] = path.split(' ', 2);

        return {
          path: endpoint,
          type: METHOD_ACTION_TYPES[method] ?? ManifestActionType.None,
          name: handler.name,
          description,
          request: {
            identity: request?.identity,
            parameters: request?.parameters,
            body: request?.body,
            ...((request?.headers || authorizer?.request?.headers) && {
              headers: {
                type: SchemaType.Object,
                properties: {
                  ...request?.headers?.properties,
                  ...authorizer?.request?.headers?.properties
                }
              }
            }),
            ...((request?.query || authorizer?.request?.query) && {
              query: {
                type: SchemaType.Object,
                properties: {
                  ...request?.query?.properties,
                  ...authorizer?.request?.query?.properties
                }
              }
            })
          },
          response: {
            body: response.body,
            headers: response.headers
          }
        };
      })
    };
  };
}
