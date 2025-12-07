import type { Ws } from '@ez4/gateway';
import type { AllEvents } from '../types';

/**
 * Handler for `message` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function messageHandler(request: Ws.Incoming<AllEvents>) {
  console.log(request);
}
