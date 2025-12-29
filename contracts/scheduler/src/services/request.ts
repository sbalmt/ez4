/**
 * Incoming request.
 */
export type CronRequest = {
  /**
   *  Unique identifier for the request.
   */
  readonly requestId: string;

  /**
   * Unique identifier across multiple services.
   */
  readonly traceId?: string;
};
