import type { CommonOptions } from '@ez4/project/library';
import type { Client, Http } from '@ez4/gateway';
import type { ClientRequest, ClientResponse } from '../types/client';
import type { ClientOperation } from '../utils/client';

import { getServiceName, Logger } from '@ez4/project/library';
import { preparePathParameters, getHttpException, prepareBodyRequest, prepareQueryStrings } from '@ez4/gateway/utils';
import { isAnyString } from '@ez4/utils';
import { HttpError } from '@ez4/gateway';

export type ClientOptions = CommonOptions & {
  operations: Record<string, ClientOperation>;
  serviceHost: string;
};

export const createClient = <T extends Http.Service>(serviceName: string, clientOptions: ClientOptions): Client<T> => {
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
  const url = getHttpRequestUrl(serviceHost, operation, request);

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

const getHttpRequestUrl = (serviceHost: string, operation: ClientOperation, request: ClientRequest) => {
  const { parameters, query } = request;
  const { path } = operation;

  const endpoint = parameters ? preparePathParameters(path, parameters) : path;
  const search = query && prepareQueryStrings(query);

  const urlParts = [serviceHost];

  if (endpoint) {
    urlParts.push(endpoint);
  }

  if (search) {
    urlParts.push('?', search);
  }

  return urlParts.join('');
};
