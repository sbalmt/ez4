import type { Ws } from '@ez4/gateway';
import type { Identity } from '../types';

/**
 * Connect request example.
 */
declare class ConnectRequest implements Ws.Request {
  identity: Identity;
}

/**
 * Handler for `connection` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function connectHandler(request: Ws.Incoming<ConnectRequest>) {
  const { identity } = request;

  console.log(identity);
  console.log(request);
}
