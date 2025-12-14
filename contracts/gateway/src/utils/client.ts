import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema, NamingStyle } from '@ez4/schema';
import type { HttpClientRequest, HttpClientResponse } from '../services/http/client';

import { prepareQueryStrings } from './query';
import { prepareRequestBody, prepareResponseBody } from './body';
import { preparePathParameters } from './parameters';
import { getHttpException } from './errors';

export type ClientRequestUrl = HttpClientRequest & {
  querySchema?: ObjectSchema;
  namingStyle?: NamingStyle;
};

export const getClientRequestUrl = (host: string, path: string, request: ClientRequestUrl) => {
  const { parameters, query, querySchema, namingStyle } = request;

  const endpoint = parameters ? preparePathParameters(path, parameters) : path;
  const search = query && prepareQueryStrings(query, querySchema, { namingStyle });

  const urlParts = [host];

  if (endpoint) {
    urlParts.push(endpoint);
  }

  if (search) {
    urlParts.push('?', search);
  }

  return urlParts.join('');
};

export type RequestAuthorization = {
  header: string;
  value: string;
};

export type ClientRequestInput = HttpClientRequest & {
  authorization?: RequestAuthorization;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  bodySchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  namingStyle?: NamingStyle;
};

export const sendClientRequest = async (url: string, method: string, request: ClientRequestInput): Promise<HttpClientResponse> => {
  const { authorization, headers, body, bodySchema, responseSchema, namingStyle, timeout = 20 } = request;

  const payload = body ? prepareRequestBody(body, bodySchema, { namingStyle }) : undefined;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller?.abort('Request timed out'), timeout * 1000);

  const result = await fetch(url, {
    signal: controller?.signal,
    body: payload?.body,
    method,
    headers: {
      ...headers,
      ...(authorization && {
        [authorization.header]: authorization.value
      }),
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
      body: prepareResponseBody(response, responseSchema, {
        namingStyle
      })
    })
  };
};
