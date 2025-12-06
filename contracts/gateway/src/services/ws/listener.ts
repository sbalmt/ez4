import type { Service } from '@ez4/common';
import type { WsIncoming } from './incoming';
import type { WsEvent } from './event';
import type { Ws } from '../ws';

/**
 * WS request listener.
 */
export type WsListener<T extends WsEvent | null> = (
  event: Service.AnyEvent<WsIncoming<T>>,
  context: Service.Context<Ws.Service<any>>
) => Promise<void> | void;
