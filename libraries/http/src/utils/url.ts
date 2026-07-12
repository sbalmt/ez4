import type { NamingStyle, ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { preparePathParameters } from './parameters';
import { prepareQueryStrings } from './query';

export type HttpRequestUrl = {
  parameters?: Record<string, string>;
  namingStyle?: NamingStyle;
  querySchema?: ObjectSchema;
  query?: AnyObject;
};

export const prepareRequestUrl = (host: string, path: string, request: HttpRequestUrl) => {
  const { parameters, query, querySchema, namingStyle } = request;

  const endpoint = parameters ? preparePathParameters(path, parameters) : path;
  const search = query && prepareQueryStrings(query, querySchema, namingStyle);

  const urlParts = [host];

  if (endpoint) {
    urlParts.push(endpoint);
  }

  if (search) {
    urlParts.push('?', search);
  }

  return urlParts.join('');
};
