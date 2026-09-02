import type { Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';
import type { Identity } from './types';
import type { WsAuthProvider } from './provider';

import { HttpForbiddenError } from '@ez4/gateway';

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
export function tokenAuthorizer(
  request: Ws.AuthIncoming<AuthorizerRequest>,
  { variables }: Service.Context<WsAuthProvider>
): AuthorizerResponse {
  const { token } = request.query;

  if (token !== variables.CONNECTION_TOKEN) {
    throw new HttpForbiddenError();
  }

  return {
    identity: {
      userId: 'abc-123'
    }
  };
}
