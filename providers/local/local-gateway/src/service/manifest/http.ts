import type { HttpService } from '@ez4/gateway/library';

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
    return {
      actions: service.routes.map(({ path, handler }) => {
        const { request, response, description } = handler;

        const [method, endpoint] = path.split(' ', 2);

        return {
          path: endpoint,
          type: METHOD_ACTION_TYPES[method] ?? ManifestActionType.None,
          request: {
            identity: request?.identity,
            headers: request?.headers,
            parameters: request?.parameters,
            query: request?.query,
            body: request?.body
          },
          response: {
            body: response.body,
            headers: response.headers
          },
          name: handler.name,
          description
        };
      })
    };
  };
}
