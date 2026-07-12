import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema, NamingStyle } from '@ez4/schema';
import type { HttpClientRequest, HttpClientResponse } from '../services/http/client';

import { prepareRequestBody, prepareResponseBody } from '@ez4/http';

import { getHttpException } from './errors';

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

  const payload = body ? prepareRequestBody(body, bodySchema, namingStyle) : undefined;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort('Request timed out'), timeout * 1000);

  const result = await fetch(url, {
    signal: controller.signal,
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

    throw getHttpException(result.status, error.message, error.context);
  }

  const response = await result.text();

  return {
    status: result.status,
    ...(response && {
      body: prepareResponseBody(response, responseSchema, namingStyle)
    })
  };
};
