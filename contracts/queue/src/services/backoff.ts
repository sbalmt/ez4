/**
 * Queue backoff configuration.
 */
export interface QueueBackoff {
  /**
   * Minimum delay time (in seconds) to retry failed messages.
   */
  readonly minDelay?: number;

  /**
   * Maximum delay time (in seconds) to retry failed messages.
   */
  readonly maxDelay: number;
}
