import type { HttpRequest } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';

import { getHeaders, getIdentity, getPathParameters, getQueryStrings, getRequestBody } from '@ez4/gateway/utils';
import { isScalarSchema } from '@ez4/schema';

export const getIncomingRequestIdentity = async <T extends Http.Identity>(request: HttpRequest, identity: T | undefined) => {
  if (!request.identity) {
    return undefined;
  }

  return {
    identity: await getIdentity(identity ?? {}, request.identity)
  };
};

export const getIncomingRequestHeaders = async (request: HttpRequest, headers: Record<string, string> | undefined) => {
  if (!request.headers) {
    return undefined;
  }

  return {
    headers: await getHeaders(headers ?? {}, request.headers)
  };
};

export const getIncomingRequestParameters = async (request: HttpRequest, parameters: Record<string, string> | undefined) => {
  if (!request.parameters) {
    return undefined;
  }

  return {
    parameters: await getPathParameters(parameters ?? {}, request.parameters)
  };
};

export const getIncomingRequestQuery = async (request: HttpRequest, query: Record<string, string> | undefined) => {
  if (!request.query) {
    return undefined;
  }

  return {
    query: await getQueryStrings(query ?? {}, request.query)
  };
};

export const getIncomingRequestBody = async (request: HttpRequest, body: Buffer | undefined) => {
  if (!request.body) {
    return undefined;
  }

  const isPlainBody = isScalarSchema(request.body);
  const bodyContent = body?.toString();

  const bodyPayload = isPlainBody ? (bodyContent ?? '') : JSON.parse(bodyContent ?? '{}');

  return {
    body: await getRequestBody(bodyPayload, request.body)
  };
};
