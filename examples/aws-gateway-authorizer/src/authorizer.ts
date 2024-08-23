import type { AuthorizerResponse, HeaderAuthorizer, QueryAuthorizer } from './types.js';

const SUPER_SECRET_API_KEY = 'ez4-api-key-example';

/**
 * Check the `authorization` header and authorize or not the request.
 */
export function headerRequestAuthorizer(request: HeaderAuthorizer): AuthorizerResponse {
  const { headers } = request;

  if (headers.authorization !== `Bearer ${SUPER_SECRET_API_KEY}`) {
    return { identity: undefined };
  }

  return {
    identity: {
      userId: 'abc123'
    }
  };
}

/**
 * Check the `apiKey` parameter from query strings and authorize or not the request.
 */
export function queryRequestAuthorizer(request: QueryAuthorizer): AuthorizerResponse {
  const { query } = request;

  if (query.apiKey !== SUPER_SECRET_API_KEY) {
    return { identity: undefined };
  }

  return {
    identity: {
      userId: 'abc123'
    }
  };
}
