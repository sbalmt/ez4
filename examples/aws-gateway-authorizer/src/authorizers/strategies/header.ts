import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { AuthorizerResponse } from '../../types';
import type { AuthProvider } from '../provider';

import { HttpForbiddenError } from '@ez4/gateway';

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
export function headerAuthorizer(request: HeaderAuthorizer, context: Service.Context<AuthProvider>): AuthorizerResponse {
  const { variables } = context;
  const { headers } = request;

  if (headers.authorization !== `Bearer ${variables.SUPER_SECRET_API_KEY}`) {
    throw new HttpForbiddenError();
  }

  return {
    identity: {
      userId: 'abc123'
    }
  };
}
