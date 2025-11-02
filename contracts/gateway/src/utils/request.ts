import type { ClientRequest } from '../services/client';

import { preparePathParameters } from './parameters';
import { prepareQueryStrings } from './query';

export const prepareRequestUrl = (host: string, path: string, request: ClientRequest) => {
  const { parameters, query } = request;

  const endpoint = parameters ? preparePathParameters(path, parameters) : path;
  const search = query && prepareQueryStrings(query);

  const urlParts = [host];

  if (endpoint) {
    urlParts.push(endpoint);
  }

  if (search) {
    urlParts.push('?', search);
  }

  return urlParts.join('');
};
