import type { Client, ClientRequest, ClientResponse, Http } from '@ez4/gateway';
import type { CommonOptions } from '@ez4/project/library';
import type { ClientOperation } from '../utils/client';

import { getServiceName, Logger } from '@ez4/project/library';
import { getHttpException, prepareBodyRequest, prepareRequestUrl } from '@ez4/gateway/utils';
import { isAnyString } from '@ez4/utils';
import { HttpError } from '@ez4/gateway';

export type ServiceClientOptions = CommonOptions & {
  operations: Record<string, ClientOperation>;
  serviceHost: string;
};

export const createServiceClient = <T extends Http.Service>(serviceName: string, clientOptions: ServiceClientOptions): Client<T> => {
  const { serviceHost, operations } = clientOptions;

  const gatewayIdentifier = getServiceName(serviceName, clientOptions);
  const gatewayHost = `http://${serviceHost}/${gatewayIdentifier}`;

  return new Proxy(
    {},
    {
      get: (_target, property) => {
        return (request: ClientRequest): Promise<ClientResponse> => {
          if (isAnyString(property) && property in operations) {
            return sendHttpRequest(serviceName, gatewayHost, operations[property], request);
          }

          throw new Error(`Operation '${property.toString()}' wasn't found.`);
        };
      }
    }
  );
};

const sendHttpRequest = async (serviceName: string, serviceHost: string, operation: ClientOperation, request: ClientRequest) => {
  const payload = request.body && prepareBodyRequest(request.body);
  const url = prepareRequestUrl(serviceHost, operation.path, request);

  try {
    Logger.debug(`🌐 Sending request to gateway [${serviceName}] at ${url}`);

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

    //
  } catch (error) {
    if (!(error instanceof HttpError)) {
      Logger.warn(`Remote gateway [${serviceName}] at ${serviceHost} isn't available.`);
    }

    throw error;
  }
};
