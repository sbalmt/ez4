/**
 * Queue dead-letter configuration.
 */
export interface QueueDeadLetter {
  /**
   * Maximum retention time (in minutes) for all messages in the dead-letter queue.
   */
  retention?: number;

  /**
   * Maximum retry attempts for the message before it fails.
   */
  maxRetries: number;
}
