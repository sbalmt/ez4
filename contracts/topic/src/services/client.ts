import type { Topic } from './contract';

/**
 * Topic client.
 */
export interface Client<T extends Topic.Event> {
  /**
   * Publish a new JSON event to all topic subscriptions.
   *
   * @param event Event object.
   */
  publishEvent(event: T): Promise<void>;
}
