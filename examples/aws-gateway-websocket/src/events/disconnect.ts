import type { Ws } from '@ez4/gateway';

/**
 * Handler for `disconnection` requests.
 * @param _request Incoming request.
 * @returns Outgoing response.
 */
export function disconnectHandler(_request: Ws.Incoming<null>) {}
