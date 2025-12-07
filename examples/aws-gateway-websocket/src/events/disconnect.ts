import type { Ws } from '@ez4/gateway';
import type { Identity } from '../types';

/**
 * Disconnect request example.
 */
declare class DisconnectRequest implements Ws.Request {
  identity: Identity;
}

/**
 * Handler for `disconnection` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function disconnectHandler(request: Ws.Incoming<DisconnectRequest>) {
  console.log(request);
}
