import type { ClientAuthorization, ClientOperation } from '@ez4/gateway/library';
import type { HttpClient, HttpClientRequest, Http } from '@ez4/gateway';

import { sendClientRequest } from '@ez4/gateway/utils';
import { prepareRequestUrl } from '@ez4/http';
import { isAnyString } from '@ez4/utils';
import { HttpError } from '@ez4/gateway';
import { Logger } from '@ez4/logger';

export type HttpServiceClientOptions = {
  authorization?: ClientAuthorization;
  operations: Record<string, ClientOperation>;
  identifier: string;
  host: string;
};

export const createHttpServiceClient = <T extends Http.Service>(
  resourceName: string,
  clientOptions: HttpServiceClientOptions
): HttpClient<T> => {
  const { identifier, host, authorization, operations } = clientOptions;

  const gatewayHost = `http://${host}/${identifier}`;

  return new Proxy(
    {},
    {
      get: (_target, property) => {
        if (!isAnyString(property) || !(property in operations)) {
          if (property !== 'then') {
            throw new Error(`Operation '${property.toString()}' wasn't found.`);
          }

          return undefined;
        }

        return async (request: HttpClientRequest) => {
          const { authorize, method, path, namingStyle, querySchema, bodySchema, responseSchema } = operations[property];

          const requestUrl = prepareRequestUrl(gatewayHost, path, {
            ...request,
            querySchema,
            namingStyle
          });

          try {
            Logger.log(`🌐 Sending request to gateway [${resourceName}] at ${requestUrl}`);

            return await sendClientRequest(requestUrl, method, {
              ...request,
              bodySchema,
              responseSchema,
              namingStyle,
              ...(authorize && {
                authorization
              })
            });

            //
          } catch (error) {
            if (!(error instanceof HttpError)) {
              Logger.warn(`Remote gateway [${resourceName}] at ${host} isn't available.`);
            }

            throw error;
          }
        };
      }
    }
  );
};
