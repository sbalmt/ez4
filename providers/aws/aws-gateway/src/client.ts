import type { ClientRequest, Http, Client as HttpClient } from '@ez4/gateway';
import type { ClientAuthorization, ClientOperation } from '@ez4/gateway/library';

import { getClientRequestUrl, sendClientRequest } from '@ez4/gateway/utils';
import { isAnyString } from '@ez4/utils';

export type ClientOperations = Record<string, ClientOperation>;

export type ClientOptions = {
  authorization?: ClientAuthorization;
  operations: ClientOperations;
};

export namespace Client {
  export const make = <T extends Http.Service>(gatewayUrl: string, options: ClientOptions): HttpClient<T> => {
    const { authorization, operations } = options;

    return new Proxy(
      {},
      {
        get: (_target, property) => {
          return (request: ClientRequest) => {
            if (!isAnyString(property) || !(property in operations)) {
              throw new Error(`Operation '${property.toString()}' wasn't found.`);
            }

            const { method, path, namingStyle, querySchema, bodySchema, responseSchema } = operations[property];

            const requestUrl = getClientRequestUrl(gatewayUrl, path, {
              ...request,
              querySchema,
              namingStyle
            });

            return sendClientRequest(requestUrl, method, {
              ...request,
              authorization,
              bodySchema,
              responseSchema,
              namingStyle
            });
          };
        }
      }
    );
  };
}
