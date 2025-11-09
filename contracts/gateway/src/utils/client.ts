import type { AnySchema, ArraySchema, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { ClientRequest, ClientResponse } from '../services/client';
import type { Http } from '../services/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { isScalarSchema, NamingStyle } from '@ez4/schema';

import { serializeQueryStrings } from './query';
import { getHttpException } from './errors';

export type ClientRequestUrl = ClientRequest & {
  querySchema?: ObjectSchema;
  namingStyle?: NamingStyle;
};

export const getClientRequestUrl = (host: string, path: string, request: ClientRequestUrl) => {
  const { parameters, query, querySchema, namingStyle } = request;

  const endpoint = parameters ? getPathParameters(path, parameters) : path;
  const search = query && getQueryStrings(query, querySchema, namingStyle);

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
  bodySchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  responseSchema?: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema;
  namingStyle?: NamingStyle;
};

export const sendClientRequest = async (url: string, method: string, request: SendClientRequest): Promise<ClientResponse> => {
  const { headers, body, bodySchema, responseSchema, namingStyle, timeout = 20 } = request;

  const payload = body ? getRequestBody(body, bodySchema, namingStyle) : undefined;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller?.abort('Request timed out'), timeout * 1000);

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

const getPathParameters = (path: string, parameters: Record<string, string>) => {
  return path.replaceAll(/\{(\w+)\}/g, (_, parameterName) => {
    if (parameterName in parameters) {
      return `${parameters[parameterName]}`;
    }

    return `{${parameterName}}`;
  });
};

const getQueryStrings = <T extends Http.QueryStrings>(query: T, querySchema?: ObjectSchema, namingStyle?: NamingStyle) => {
  if (!querySchema) {
    return serializeQueryStrings(query);
  }

  const context = createTransformContext({
    inputStyle: namingStyle,
    convert: false
  });

  const payload = transform(query, querySchema, context) as T;

  return serializeQueryStrings(payload, querySchema);
};

const getRequestBody = (request: string | AnyObject, requestSchema?: AnySchema, namingStyle?: NamingStyle) => {
  if (!requestSchema || isScalarSchema(requestSchema)) {
    return {
      body: request.toString(),
      json: false
    };
  }

  const context = createTransformContext({
    outputStyle: namingStyle,
    convert: false
  });

  const payload = transform(request, requestSchema, context);

  return {
    body: JSON.stringify(payload),
    json: true
  };
};

const getResponseBody = (response: string, responseSchema?: AnySchema, namingStyle?: NamingStyle) => {
  if (!responseSchema || isScalarSchema(responseSchema)) {
    return response;
  }

  const payload = JSON.parse(response);

  const context = createTransformContext({
    outputStyle: NamingStyle.Preserve,
    inputStyle: namingStyle,
    convert: false
  });

  return transform(payload, responseSchema, context);
};
