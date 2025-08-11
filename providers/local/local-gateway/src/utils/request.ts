import type { HttpRequest } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from './route.js';

import { getHeaders, getIdentity, getPathParameters, getQueryStrings, getRequestBody } from '@ez4/gateway/utils';
import { isScalarSchema } from '@ez4/schema';

export const getIncomingRequestIdentity = async <T extends Http.Identity>(metadata: HttpRequest, identity: T | undefined) => {
  if (!metadata.identity) {
    return undefined;
  }

  return {
    identity: await getIdentity(identity ?? {}, metadata.identity)
  };
};

export const getIncomingRequestHeaders = async (metadata: HttpRequest, route: MatchingRoute) => {
  if (!metadata.headers) {
    return undefined;
  }

  return {
    headers: await getHeaders(route.headers ?? {}, metadata.headers)
  };
};

export const getIncomingRequestParameters = async (metadata: HttpRequest, route: MatchingRoute) => {
  if (!metadata.parameters) {
    return undefined;
  }

  return {
    parameters: await getPathParameters(route.parameters ?? {}, metadata.parameters)
  };
};

export const getIncomingRequestQuery = async (metadata: HttpRequest, route: MatchingRoute) => {
  if (!metadata.query) {
    return undefined;
  }

  return {
    query: await getQueryStrings(route.query ?? {}, metadata.query, route.preferences)
  };
};

export const getIncomingRequestBody = async (metadata: HttpRequest, route: MatchingRoute) => {
  if (!metadata.body) {
    return undefined;
  }

  const content = route.body?.toString();
  const request = isScalarSchema(metadata.body) ? content : content && JSON.parse(content);

  const payload = await getRequestBody(request, metadata.body, route.preferences);

  return {
    body: payload
  };
};
