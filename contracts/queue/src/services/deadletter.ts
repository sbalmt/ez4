/**
 * Queue dead-letter configuration.
 */
export interface QueueDeadLetter {
  /**
   * Maximum retention time (in minutes) for all messages in the dead-letter queue.
   */
  readonly retention?: number;

  /**
   * Maximum attempts for the message before it goes to the dead-letter queue.
   */
  readonly maxAttempts: number;
}
