import type { Http } from '@ez4/gateway';
import type { AuthorizerResponse } from '../types';

import { HttpForbiddenError } from '@ez4/gateway';

const SUPER_SECRET_API_KEY = 'query-api-key';

/**
 * Token authorizer example.
 */
declare class TokenAuthorizer implements Http.AuthRequest {
  query: {
    token: string;
  };
}

/**
 * Check the `token` query string and authorize or not the request.
 */
export function tokenAuthorizer(request: TokenAuthorizer): AuthorizerResponse {
  const { token } = request.query;

  if (token !== SUPER_SECRET_API_KEY) {
    throw new HttpForbiddenError();
  }

  return {
    identity: {
      userId: 'abc123'
    }
  };
}
