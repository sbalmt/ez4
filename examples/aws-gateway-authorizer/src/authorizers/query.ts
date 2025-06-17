import type { Http } from '@ez4/gateway';
import type { AuthorizerResponse } from '../types.js';

const SUPER_SECRET_API_KEY = 'query-api-key';

/**
 * Query authorizer example.
 */
declare class QueryAuthorizer implements Http.AuthRequest {
  query: {
    apiKey: string;
  };
}

/**
 * Check the `apiKey` parameter from query strings and authorize or not the request.
 */
export function queryAuthorizer(request: QueryAuthorizer): AuthorizerResponse {
  const { query } = request;

  if (query.apiKey !== SUPER_SECRET_API_KEY) {
    return {
      identity: undefined
    };
  }

  return {
    identity: {
      userId: 'abc123'
    }
  };
}
