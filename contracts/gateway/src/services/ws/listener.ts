import type { Service } from '@ez4/common';
import type { WsIncoming } from './incoming';
import type { WsRequest } from './request';
import type { WsEvent } from './event';
import type { Ws } from './contract';

/**
 * WS request listener.
 */
export type WsListener<T extends WsRequest | WsEvent> = (
  event: Service.AnyEvent<WsIncoming<T> | T>,
  context: Service.Context<Ws.Service<any>>
) => Promise<void> | void;
