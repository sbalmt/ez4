/**
 * Definition of a queue message.
 */
export interface QueueMessage {}

/**
 * Incoming queue request.
 */
export type QueueIncomingRequest<T extends QueueMessage> = {
  /**
   * Request Id.
   */
  requestId: string;

  /**
   * Message payload.
   */
  message: T;
};
