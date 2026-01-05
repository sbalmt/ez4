import type { WsRequest } from './request';
import type { WsEvent } from './event';

/**
 * Incoming WS event.
 */
export type WsIncoming<T extends WsRequest | WsEvent> = T & {
  /**
   *  Unique identifier for the request.
   */
  readonly requestId: string;

  /**
   * Unique identifier across multiple services.
   */
  readonly traceId?: string;

  /**
   * Request connection Id.
   */
  readonly connectionId: string;

  /**
   * Request timestamp.
   */
  readonly timestamp: Date;
};
