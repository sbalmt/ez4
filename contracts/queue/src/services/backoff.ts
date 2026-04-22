/**
 * Queue backoff configuration.
 */
export interface QueueBackoff {
  /**
   * Minimum delay time (in seconds) to retry failed messages.
   * Default is: `5`
   */
  readonly minDelay?: number;

  /**
   * Maximum delay time (in seconds) to retry failed messages.
   * Default is: `30`
   */
  readonly maxDelay: number;
}
