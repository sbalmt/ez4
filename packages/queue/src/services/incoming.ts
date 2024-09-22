import type { MessageSchema } from './message.js';

/**
 * Incoming queue message.
 */
export type IncomingRequest<T extends MessageSchema> = {
  /**
   * Request Id.
   */
  requestId: string;

  /**
   * Message payload.
   */
  message: T;
};
