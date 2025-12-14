import type { Ws } from '@ez4/gateway';
import type { Identity } from '../authorizers/types';

/**
 * Disconnect event example.
 */
declare class DisconnectEvent implements Ws.Event {
  identity: Identity;
}

/**
 * Handler for `disconnection` events.
 * @param event Incoming event.
 */
export function disconnectHandler(event: Ws.Incoming<DisconnectEvent>) {
  console.log(event);
}
