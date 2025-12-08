import type { HttpPath } from '../../services/http/path';

const ALL_VERBS = new Set(['ANY', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export const isHttpPath = (path: string): path is HttpPath => {
  const [verb] = path.split(' ', 2);

  return ALL_VERBS.has(verb);
};
