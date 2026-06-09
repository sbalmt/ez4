import type { HttpService } from '@ez4/gateway/library';

import { ManifestActionType } from '@ez4/project/library';

const METHOD_ACTION_TYPES: Record<string, ManifestActionType> = {
  HEAD: ManifestActionType.Head,
  GET: ManifestActionType.Get,
  POST: ManifestActionType.Post,
  PUT: ManifestActionType.Put,
  PATCH: ManifestActionType.Patch
};

export namespace HttpManifest {
  export const build = (service: HttpService) => {
    return {
      actions: service.routes.map(({ path, name, handler }) => {
        const { request } = handler;

        const [method, endpoint] = path.split(' ', 2);

        return {
          path: endpoint,
          type: METHOD_ACTION_TYPES[method] ?? ManifestActionType.None,
          name: name ?? handler.name,
          identity: request?.identity,
          parameters: request?.parameters,
          query: request?.query,
          headers: request?.headers,
          body: request?.body
        };
      })
    };
  };
}
