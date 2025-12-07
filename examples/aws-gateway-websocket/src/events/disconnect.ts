import type { Ws } from '@ez4/gateway';

/**
 * Handler for `disconnection` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function disconnectHandler(request: Ws.Incoming<Ws.EmptyRequest>) {
  console.log(request);
}
