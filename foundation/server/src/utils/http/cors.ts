import type { IncomingMessage } from 'node:http';
import type { HttpProviderCors, HttpProviderCorsOptions } from '../../types/provider';

import { isAnyNumber } from '@ez4/utils';

import { getSanitizedHeader, getSanitizedHeaders } from './headers';

export const getHttpCorsPreflightHeaders = (request: IncomingMessage, cors?: HttpProviderCors): Record<string, string> | undefined => {
  const { ['access-control-request-method']: method, ['access-control-request-headers']: headers, origin } = request.headers;

  if (!cors || !origin) {
    return undefined;
  }

  if (cors === true) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': method ?? request.method ?? 'OPTIONS',
      ...(headers && { 'Access-Control-Allow-Headers': headers })
    };
  }

  if (!method || !isOriginAllowed(cors, origin) || !isMethodAllowed(cors, method) || (headers && !isHeadersAllowed(cors, headers))) {
    return undefined;
  }

  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(cors, origin),
    ...(cors.allowCredentials && { 'Access-Control-Allow-Credentials': 'true' }),
    ...(cors.allowMethods?.length && { 'Access-Control-Allow-Methods': cors.allowMethods.join(',') }),
    ...(cors.allowHeaders?.length && { 'Access-Control-Allow-Headers': cors.allowHeaders.join(',') }),
    ...(cors.exposeHeaders?.length && { 'Access-Control-Expose-Headers': cors.exposeHeaders.join(',') }),
    ...(isAnyNumber(cors.maxAge) && { 'Access-Control-Max-Age': cors.maxAge.toString() })
  };
};

export const getHttpCorsResponseHeaders = (request: IncomingMessage, cors?: HttpProviderCors, headers?: Record<string, string>) => {
  if (!cors) {
    return headers;
  }

  const corsHeaders = getHeadersWithoutCors(headers);
  const origin = request.headers.origin;

  if (cors === true) {
    if (origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    return corsHeaders;
  }

  if (origin && isOriginAllowed(cors, origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = getAllowedOrigin(cors, origin);

    if (cors.allowCredentials) {
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    if (cors.exposeHeaders?.length) {
      corsHeaders['Access-Control-Expose-Headers'] = cors.exposeHeaders.join(',');
    }
  }

  return corsHeaders;
};

const getHeadersWithoutCors = (headers: Record<string, string> | undefined) => {
  const result: Record<string, string> = {};

  for (const name in headers) {
    if (!name.toLowerCase().startsWith('access-control-')) {
      result[name] = headers[name];
    }
  }

  return result;
};

const isOriginAllowed = (cors: HttpProviderCorsOptions, origin: string) => {
  return cors.allowOrigins.some((allowed) => {
    if (allowed === '*' || allowed === origin) {
      return true;
    }

    if (allowed.endsWith('://*')) {
      return origin.startsWith(allowed.slice(0, -1));
    }

    return false;
  });
};

const isMethodAllowed = (cors: HttpProviderCorsOptions, method: string) => {
  return (cors.allowMethods ?? []).some((allowed) => {
    return allowed === '*' || allowed.toUpperCase() === method.toUpperCase();
  });
};

const isHeadersAllowed = (cors: HttpProviderCorsOptions, headers: string) => {
  const allowHeaders = getSanitizedHeaders(cors.allowHeaders ?? []);

  if (allowHeaders.includes('*')) {
    return true;
  }

  return headers.split(',').every((header) => {
    return allowHeaders.includes(getSanitizedHeader(header));
  });
};

const getAllowedOrigin = (cors: HttpProviderCorsOptions, origin: string) => {
  if (!cors.allowCredentials && cors.allowOrigins.includes('*')) {
    return '*';
  }

  return origin;
};
