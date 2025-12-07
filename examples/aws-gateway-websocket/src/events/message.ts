import type { Ws } from '@ez4/gateway';
import type { AllEvents, Identity } from '../types';

/**
 * Message event example.
 */
declare class MessageEvent implements Ws.Event {
  identity: Identity;
  body: AllEvents;
}

/**
 * Handler for `message` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function messageHandler(request: Ws.Incoming<MessageEvent>) {
  console.log(request);
}
