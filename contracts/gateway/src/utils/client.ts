import { isScalarSchema, type AnySchema, type NamingStyle } from '@ez4/schema';
import type { ClientRequest, ClientResponse } from '../services/client';

import { createTransformContext, transform } from '@ez4/transform';

import { getHttpException } from './errors';
import { preparePathParameters } from './parameters';
import { prepareQueryStrings } from './query';
import { prepareBodyRequest } from './body';

export const getClientRequestUrl = (host: string, path: string, request: ClientRequest) => {
  const { parameters, query } = request;

  const endpoint = parameters ? preparePathParameters(path, parameters) : path;
  const search = query && prepareQueryStrings(query);

  const urlParts = [host];

  if (endpoint) {
    urlParts.push(endpoint);
  }

  if (search) {
    urlParts.push('?', search);
  }

  return urlParts.join('');
};

export type SendClientRequest = ClientRequest & {
  responseSchema?: AnySchema;
  namingStyle?: NamingStyle;
};

export const sendClientRequest = async (url: string, method: string, request: SendClientRequest): Promise<ClientResponse> => {
  const { headers, body, responseSchema, namingStyle, timeout = 20 } = request;

  const payload = body ? prepareBodyRequest(body) : undefined;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller?.abort('Request timed out'), timeout);

  const result = await fetch(url, {
    signal: controller?.signal,
    body: payload?.body,
    method,
    headers: {
      ...headers,
      ...(payload?.json && {
        ['content-type']: 'application/json'
      })
    }
  });

  clearTimeout(timerId);

  if (!result.ok) {
    const error = await result.json();

    throw getHttpException(result.status, error.message, error.details);
  }

  const response = await result.text();

  return {
    status: result.status,
    ...(response && {
      body: getResponseBody(response, responseSchema, namingStyle)
    })
  };
};

const getResponseBody = (response: string, responseSchema?: AnySchema, namingStyle?: NamingStyle) => {
  if (!responseSchema || isScalarSchema(responseSchema)) {
    return response;
  }

  const data = JSON.parse(response);

  const context = createTransformContext({
    inputStyle: namingStyle,
    convert: false
  });

  return transform(data, responseSchema, context);
};
