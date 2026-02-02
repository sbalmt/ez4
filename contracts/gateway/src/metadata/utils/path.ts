import type { HttpPath, HttpVerb } from '../../services/http/path';

const ALL_VERBS = new Set<HttpVerb>(['ANY', 'GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export const isHttpPath = (path: string): path is HttpPath => {
  const [verb] = path.split(' ', 2);

  return ALL_VERBS.has(verb as HttpVerb);
};
