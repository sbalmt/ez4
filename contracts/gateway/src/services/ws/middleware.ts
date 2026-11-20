import type { WsHandler } from './handler';
import type { WsResponse } from './response';
import type { WsRequest } from './request';
import type { WsEvent } from './event';

/**
 * WebSocket handler middleware.
 */
export type WsMiddleware<T extends WsRequest | WsEvent, U extends WsResponse | void> = (next: WsHandler<T, U>) => WsHandler<T, U>;
