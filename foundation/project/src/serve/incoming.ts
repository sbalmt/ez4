import type { IncomingMessage } from 'node:http';
import type { ServiceEmulators } from '../emulator/service';
import type { ServeOptions } from '../types/options';

import { isAnyArray } from '@ez4/utils';

export const getIncomingService = (emulator: ServiceEmulators, request: IncomingMessage, options: ServeOptions) => {
  if (!request.url) {
    return undefined;
  }

  const { pathname, searchParams } = new URL(request.url, `ez4://${options.serviceHost}`);
  const [, identifier, ...path] = pathname.split('/');

  return {
    identifier,
    emulator: emulator[identifier],
    request: {
      path: `/${path.join('/')}`,
      headers: getDistinctHeaders(request.headersDistinct),
      query: getQueryParameters(searchParams)
    }
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

const getDistinctHeaders = (allHeaders: Record<string, string[] | undefined>) => {
  const distinctHeaders: Record<string, string> = {};

  for (const name in allHeaders) {
    const value = allHeaders[name];

    if (isAnyArray(value)) {
      distinctHeaders[name] = value[0];
    }
  }

  return distinctHeaders;
};
