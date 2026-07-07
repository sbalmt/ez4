/**
 * Incoming request.
 */
export type QueueRequest = {
  /**
   *  Unique identifier for the request.
   */
  readonly requestId: string;

  /**
   * Current attempt increased on every queue retry.
   */
  readonly attempt: number;

  /**
   * Maximum retries to process the message.
   */
  readonly maxRetries: number;

  /**
   * Unique identifier across multiple services.
   */
  readonly traceId?: string;
};
