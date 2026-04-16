import type { QueueMessage } from './message';

/**
 * Fair queue mode options.
 */
export interface QueueFairMode<T extends QueueMessage> {
  /**
   * Name of the message group Id field.
   */
  readonly groupId: keyof T;
}
