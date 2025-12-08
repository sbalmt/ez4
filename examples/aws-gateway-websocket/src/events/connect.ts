import type { Ws } from '@ez4/gateway';
import type { Identity } from '../types';

/**
 * Connection event example.
 */
declare class ConnectEvent implements Ws.Event {
  identity: Identity;
}

/**
 * Handler for `connection` events.
 * @param event Incoming event.
 */
export function connectHandler(event: Ws.Incoming<ConnectEvent>) {
  console.log(event);
}
