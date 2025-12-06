import type { HttpJsonBody } from '../common';

/**
 * Incoming WS event.
 */
export type WsIncoming<T extends HttpJsonBody | null> = {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;

  /**
   * Request timestamp.
   */
  readonly timestamp: Date;

  /**
   * Event payload.
   */
  readonly event: T;
};
