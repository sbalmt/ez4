import type { PublicRequest, PrivateRequest, GeneralResponse } from './types.js';

/**
 * Handler for `public` requests.
 * @param _request Incoming request.
 * @returns Outgoing response.
 */
export function publicRequestHandler(_request: PublicRequest): GeneralResponse {
  return {
    status: 200,
    body: {
      message: 'Public request'
    }
  };
}

/**
 * Handler for `private` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function privateRequestHandler(request: PrivateRequest): GeneralResponse {
  const { identity } = request;

  return {
    status: 200,
    body: {
      message: `Private request with user ${identity.userId}`
    }
  };
}
