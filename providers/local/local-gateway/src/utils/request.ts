import type { HttpRequest, WsEvent, WsRequest } from '@ez4/gateway/library';
import type { Http, Ws } from '@ez4/gateway';

import { getHeaders, getIdentity, getPathParameters, getQueryStrings, getRequestBody } from '@ez4/gateway/utils';
import { isObjectSchema, isScalarSchema } from '@ez4/schema';

export type IncomingRequest = {
  preferences?: Http.Preferences | Ws.Preferences;
  parameters?: Record<string, string>;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: Buffer;
};

export const getIncomingRequestIdentity = async <T extends Http.Identity>(
  metadata: HttpRequest | WsRequest | WsEvent,
  identity: T | undefined
) => {
  if (!metadata.identity) {
    return undefined;
  }

  return {
    identity: await getIdentity(identity ?? {}, metadata.identity)
  };
};

export const getIncomingRequestHeaders = async (metadata: HttpRequest | WsEvent, route: IncomingRequest) => {
  if (!metadata.headers) {
    return undefined;
  }

  return {
    headers: await getHeaders(route.headers ?? {}, metadata.headers)
  };
};

export const getIncomingRequestParameters = async (metadata: HttpRequest, route: IncomingRequest) => {
  if (!metadata.parameters) {
    return undefined;
  }

  return {
    parameters: await getPathParameters(route.parameters ?? {}, metadata.parameters)
  };
};

export const getIncomingRequestQuery = async (metadata: HttpRequest | WsEvent, target: IncomingRequest) => {
  if (!metadata.query) {
    return undefined;
  }

  return {
    query: await getQueryStrings(target.query ?? {}, metadata.query, target.preferences)
  };
};

export const getIncomingRequestBody = async (metadata: HttpRequest | WsEvent, target: IncomingRequest) => {
  if (!metadata.body) {
    return undefined;
  }

  const { body } = metadata;

  const data = target.body?.toString();

  if (isScalarSchema(body) || (isObjectSchema(body) && body.definitions?.encoded)) {
    const payload = await getRequestBody(data, body, target.preferences);

    return {
      body: payload
    };
  }

  const content = data && JSON.parse(data);
  const payload = await getRequestBody(content, body, target.preferences);

  return {
    body: payload
  };
};
