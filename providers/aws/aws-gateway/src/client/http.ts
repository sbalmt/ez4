import type { HttpClient as HttpClientType, HttpClientRequest, Http } from '@ez4/gateway';
import type { ClientAuthorization, ClientOperation } from '@ez4/gateway/library';

import { getClientRequestUrl, sendClientRequest } from '@ez4/gateway/utils';
import { getRandomUUID, isAnyString } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export type ClientOperations = Record<string, ClientOperation>;

export namespace HttpClient {
  export type Options = {
    authorization?: ClientAuthorization;
    operations: ClientOperations;
  };

  export const make = <T extends Http.Service>(gatewayUrl: string, options: Options): HttpClientType<T> => {
    const { authorization, operations } = options;

    return new Proxy(
      {},
      {
        get: (_target, property) => {
          return (request: HttpClientRequest) => {
            if (!isAnyString(property) || !(property in operations)) {
              throw new Error(`Operation '${property.toString()}' wasn't found.`);
            }

            const { authorize, method, path, namingStyle, querySchema, bodySchema, responseSchema } = operations[property];

            const scope = Runtime.getScope();

            const requestUrl = getClientRequestUrl(gatewayUrl, path, {
              ...request,
              querySchema,
              namingStyle
            });

            return sendClientRequest(requestUrl, method, {
              ...request,
              bodySchema,
              responseSchema,
              namingStyle,
              headers: {
                ['X-Trace-Id']: scope?.traceId ?? getRandomUUID(),
                ...request.headers
              },
              ...(authorize && {
                authorization
              })
            });
          };
        }
      }
    );
  };
}
