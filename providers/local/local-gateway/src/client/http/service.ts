import type { ClientAuthorization, ClientOperation } from '@ez4/gateway/library';
import type { HttpClient, HttpClientRequest, Http } from '@ez4/gateway';
import type { CommonOptions } from '@ez4/project/library';

import { getServiceName, Logger } from '@ez4/project/library';
import { getClientRequestUrl, sendClientRequest } from '@ez4/gateway/utils';
import { isAnyString } from '@ez4/utils';
import { HttpError } from '@ez4/gateway';

export type HttpServiceClientOptions = CommonOptions & {
  authorization?: ClientAuthorization;
  operations: Record<string, ClientOperation>;
  serviceHost: string;
};

export const createHttpServiceClient = <T extends Http.Service>(
  serviceName: string,
  clientOptions: HttpServiceClientOptions
): HttpClient<T> => {
  const { serviceHost, authorization, operations } = clientOptions;

  const gatewayIdentifier = getServiceName(serviceName, clientOptions);
  const gatewayHost = `http://${serviceHost}/${gatewayIdentifier}`;

  return new Proxy(
    {},
    {
      get: (_target, property) => {
        return async (request: HttpClientRequest) => {
          if (!isAnyString(property) || !(property in operations)) {
            throw new Error(`Operation '${property.toString()}' wasn't found.`);
          }

          const { authorize, method, path, namingStyle, querySchema, bodySchema, responseSchema } = operations[property];

          const requestUrl = getClientRequestUrl(gatewayHost, path, {
            ...request,
            querySchema,
            namingStyle
          });

          try {
            Logger.debug(`🌐 Sending request to gateway [${serviceName}] at ${requestUrl}`);

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
              Logger.warn(`Remote gateway [${serviceName}] at ${serviceHost} isn't available.`);
            }

            throw error;
          }
        };
      }
    }
  );
};
