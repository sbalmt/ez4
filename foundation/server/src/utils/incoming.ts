import type { IncomingHttpHeaders, IncomingMessage } from 'node:http';
import type { IncomingRequest } from '../types/request';
import type { ServerOptions } from '../types/server';

import { isAnyArray } from '@ez4/utils';

import { providerRegistered } from '../runtime/provider';

export const getIncomingRequest = (request: IncomingMessage, options: ServerOptions): IncomingRequest | undefined => {
  if (!request.url) {
    return undefined;
  }

  try {
    const { pathname, searchParams } = new URL(request.url, `ez4://${options.host}`);
    const { provider, path } = getIncomingProvider(pathname);

    return {
      provider,
      request: {
        headers: getDistinctHeaders(request.headers),
        query: getQueryParameters(searchParams),
        path
      }
    };
  } catch {
    return undefined;
  }
};

const getIncomingProvider = (pathname: string) => {
  const segments = pathname.split('/').slice(1);

  let [provider] = segments;

  let position = 1;

  for (let length = segments.length; length > 1; length--) {
    const candidate = segments.slice(0, length).join('/');

    if (providerRegistered(candidate)) {
      provider = candidate;
      position = length;
      break;
    }
  }

  return {
    path: provider ? `/${segments.slice(position).join('/')}` : pathname,
    provider
  };
};

const getQueryParameters = (allParameters: URLSearchParams) => {
  const query: Record<string, string> = {};

  for (const name of allParameters.keys()) {
    const allValues = allParameters.getAll(name);

    query[name] = allValues.join(',');
  }

  return query;
};

const getDistinctHeaders = (allHeaders: IncomingHttpHeaders) => {
  const headers: Record<string, string> = {};

  for (const name in allHeaders) {
    const value = allHeaders[name];

    if (isAnyArray(value)) {
      headers[name] = value[0];
    } else if (value) {
      headers[name] = value;
    }
  }

  return headers;
};
