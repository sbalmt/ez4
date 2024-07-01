/**
 * All supported HTTP verbs.
 */
export type HttpVerb = 'ANY' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

/**
 * Valid HTTP path.
 */
export type HttpPath = `${HttpVerb} /${string}`;

const allVerbs = new Set(['ANY', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export const isHttpPath = (path: string): path is HttpPath => {
  const [verb] = path.split(' ', 2);

  return allVerbs.has(verb);
};
