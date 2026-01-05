import type { HttpRequest, WsEvent, WsRequest } from '@ez4/gateway/library';
import type { ValidationCustomHandler } from '@ez4/validator';
import type { Http, Ws } from '@ez4/gateway';

import { resolveHeaders, resolveIdentity, resolvePathParameters, resolveQueryStrings, resolveRequestBody } from '@ez4/gateway/utils';
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
  identity: T | undefined,
  onCustomValidation?: ValidationCustomHandler
) => {
  if (!metadata.identity) {
    return undefined;
  }

  return {
    identity: await resolveIdentity(identity ?? {}, metadata.identity, onCustomValidation)
  };
};

export const getIncomingRequestHeaders = async (
  metadata: HttpRequest | WsEvent,
  route: IncomingRequest,
  onCustomValidation?: ValidationCustomHandler
) => {
  if (!metadata.headers) {
    return undefined;
  }

  return {
    headers: await resolveHeaders(route.headers ?? {}, metadata.headers, onCustomValidation)
  };
};

export const getIncomingRequestParameters = async (
  metadata: HttpRequest,
  route: IncomingRequest,
  onCustomValidation?: ValidationCustomHandler
) => {
  if (!metadata.parameters) {
    return undefined;
  }

  return {
    parameters: await resolvePathParameters(route.parameters ?? {}, metadata.parameters, onCustomValidation)
  };
};

export const getIncomingRequestQuery = async (
  metadata: HttpRequest | WsEvent,
  target: IncomingRequest,
  onCustomValidation?: ValidationCustomHandler
) => {
  if (!metadata.query) {
    return undefined;
  }

  const { preferences } = target;

  return {
    query: await resolveQueryStrings(target.query ?? {}, metadata.query, preferences, onCustomValidation)
  };
};

export const getIncomingRequestBody = async (
  metadata: HttpRequest | WsEvent,
  target: IncomingRequest,
  onCustomValidation?: ValidationCustomHandler
) => {
  if (!metadata.body) {
    return undefined;
  }

  const { body } = metadata;
  const { preferences } = target;

  const data = target.body?.toString();

  if (isScalarSchema(body) || (isObjectSchema(body) && body.definitions?.encoded)) {
    const payload = await resolveRequestBody(data, body, preferences, onCustomValidation);

    return {
      body: payload
    };
  }

  const content = data && JSON.parse(data);
  const payload = await resolveRequestBody(content, body, preferences, onCustomValidation);

  return {
    body: payload
  };
};
