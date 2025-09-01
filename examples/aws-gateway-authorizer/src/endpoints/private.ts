import type { Http } from '@ez4/gateway';
import type { GeneralResponse, Identity } from '../types';

/**
 * Private request example.
 */
declare class PrivateRequest implements Http.Request {
  identity: Identity;
}

/**
 * Handler for `private` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function privateHandler(request: PrivateRequest): GeneralResponse {
  const { identity } = request;

  return {
    status: 200,
    body: {
      message: `Private request with user ${identity.userId}`
    }
  };
}
