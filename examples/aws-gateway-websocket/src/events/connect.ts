import type { Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';
import type { Identity } from '../authorizers/types';
import type { WsApi } from '../service';

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
export async function connectHandler(event: Ws.Incoming<ConnectEvent>, context: Service.Context<WsApi>) {
  const { connectionId, identity } = event;
  const { helloQueue } = context;

  await helloQueue.sendMessage({
    userId: identity.userId,
    connectionId
  });
}
