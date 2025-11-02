import type { ClientRequest, Http, Client as HttpClient } from '@ez4/gateway';
import type { ClientOperation } from './client/utils';

import { getHttpException, prepareBodyRequest, prepareRequestUrl } from '@ez4/gateway/utils';
import { isAnyString } from '@ez4/utils';

export type ClientOperations = Record<string, ClientOperation>;

export namespace Client {
  export const make = <T extends Http.Service>(gatewayUrl: string, operations: ClientOperations): HttpClient<T> => {
    return new Proxy(
      {},
      {
        get: (_target, property) => {
          return (request: ClientRequest) => {
            if (isAnyString(property) && property in operations) {
              return sendHttpRequest(gatewayUrl, operations[property], request);
            }

            throw new Error(`Operation '${property.toString()}' wasn't found.`);
          };
        }
      }
    );
  };
}

const sendHttpRequest = async (gatewayUrl: string, operation: ClientOperation, request: ClientRequest) => {
  const payload = request.body && prepareBodyRequest(request.body);
  const url = prepareRequestUrl(gatewayUrl, operation.path, request);

  const result = await fetch(url, {
    method: operation.method,
    body: payload,
    headers: {
      ...request.headers,
      ...(payload && {
        ['content-type']: 'application/json'
      })
    }
  });

  const response = await result.json();

  if (!result.ok) {
    throw getHttpException(result.status, response.message, response.details);
  }

  return {
    status: result.status,
    body: response
  };
};
