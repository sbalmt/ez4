import type { Service } from '@ez4/common';
import type { WsIncoming } from './incoming';
import type { WsResponse } from './response';
import type { WsRequest } from './request';
import type { WsEvent } from './event';
import type { Ws } from './contract';

/**
 * WS request handler.
 */
export type WsHandler<T extends WsRequest | WsEvent> = (
  request: WsIncoming<T> | T,
  context: Service.Context<Ws.Service<any>>
) => Promise<WsResponse | void> | WsResponse | void;
