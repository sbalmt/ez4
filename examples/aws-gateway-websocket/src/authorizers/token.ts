import type { Ws } from '@ez4/gateway';
import type { Identity } from './types';

import { HttpForbiddenError } from '@ez4/gateway';

const SUPER_SECRET_API_KEY = 'query-api-key';

/**
 * Token authorizer example.
 */
declare class AuthorizerRequest implements Ws.AuthRequest {
  query: {
    token: string;
  };
}

/**
 * Authorization response.
 */
export declare class AuthorizerResponse implements Ws.AuthResponse {
  identity: Identity;
}

/**
 * Check the `token` query string and authorize or not the request.
 */
export function tokenAuthorizer(request: AuthorizerRequest): AuthorizerResponse {
  const { token } = request.query;

  if (token !== SUPER_SECRET_API_KEY) {
    throw new HttpForbiddenError();
  }

  return {
    identity: {
      userId: 'abc-123'
    }
  };
}
