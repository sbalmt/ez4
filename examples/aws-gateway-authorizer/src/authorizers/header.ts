import type { Http } from '@ez4/gateway';
import type { AuthorizerResponse } from '../types.js';

const SUPER_SECRET_API_KEY = 'header-api-key';

/**
 * Header authorizer example.
 */
declare class HeaderAuthorizer implements Http.AuthRequest {
  headers: {
    authorization: string;
  };
}

/**
 * Check the `authorization` header and authorize or not the request.
 */
export function headerAuthorizer(request: HeaderAuthorizer): AuthorizerResponse {
  const { headers } = request;

  if (headers.authorization !== `Bearer ${SUPER_SECRET_API_KEY}`) {
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
