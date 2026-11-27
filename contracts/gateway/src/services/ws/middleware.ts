import type { Service } from '@ez4/common';
import type { WsHandler } from './handler';
import type { WsResponse } from './response';
import type { WsRequest } from './request';
import type { WsEvent } from './event';
import type { Ws } from './contract';

/**
 * WebSocket handler middleware.
 */
export type WsMiddleware<T extends WsRequest | WsEvent, U extends WsResponse | void> = (
  next: WsHandler<T, U>,
  context: Service.Context<Ws.Service<any>>
) => WsHandler<T, U>;
