import type { IncomingHttpHeaders, IncomingMessage } from 'node:http';
import type { IncomingRequest } from '../types/request';
import type { ServerOptions } from '../types/server';

import { isAnyArray } from '@ez4/utils';

export const getIncomingRequest = (request: IncomingMessage, options: ServerOptions): IncomingRequest | undefined => {
  if (!request.url) {
    return undefined;
  }

  try {
    const { pathname, searchParams } = new URL(request.url, `ez4://${options.host}`);
    const [, provider, ...path] = pathname.split('/');

    return {
      provider,
      request: {
        path: provider ? `/${path.join('/')}` : pathname,
        headers: getDistinctHeaders(request.headers),
        query: getQueryParameters(searchParams)
      }
    };
  } catch {
    return undefined;
  }
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
