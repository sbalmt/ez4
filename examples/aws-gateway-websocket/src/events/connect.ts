import type { Http } from '@ez4/gateway';
import type { Identity } from '../types';

/**
 * Connect request example.
 */
declare class ConnectRequest implements Http.Request {
  identity: Identity;
}

/**
 * Handler for `connection` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function connectHandler(request: ConnectRequest): Http.SuccessEmptyResponse {
  const { identity } = request;

  console.log(identity);

  return {
    status: 204
  };
}
