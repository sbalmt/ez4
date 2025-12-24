import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { AuthorizerResponse } from '../../types';
import type { AuthProvider } from '../provider';

import { HttpUnauthorizedError } from '@ez4/gateway';

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
export function queryAuthorizer(request: QueryAuthorizer, context: Service.Context<AuthProvider>): AuthorizerResponse {
  const { variables } = context;
  const { query } = request;

  if (query.apiKey !== variables.SUPER_SECRET_API_KEY) {
    throw new HttpUnauthorizedError();
  }

  return {
    identity: {
      userId: 'abc123'
    }
  };
}
