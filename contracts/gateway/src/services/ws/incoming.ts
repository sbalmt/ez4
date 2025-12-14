import type { WsRequest } from './request';
import type { WsEvent } from './event';

/**
 * Incoming WS event.
 */
export type WsIncoming<T extends WsRequest | WsEvent> = T & {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;

  /**
   * Request connection Id.
   */
  readonly connectionId: string;

  /**
   * Request timestamp.
   */
  readonly timestamp: Date;
};
