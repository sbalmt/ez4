import type { Service } from '@ez4/common';
import type { Client } from './client.js';

import type {
  MessageSchema,
  IncomingRequest,
  RequestHandler,
  SubscriptionEntry
} from './common.js';

/**
 * Provide all contracts for a self-managed notification service.
 */
export namespace Notification {
  export type Message = MessageSchema;

  export type Handler<T extends Message> = RequestHandler<T>;

  export type Subscription<T extends Message> = SubscriptionEntry<T>;

  export type Incoming<T extends Message> = IncomingRequest<T>;

  /**
   * Notification service.
   */
  export declare abstract class Service<T extends Message> implements Service.Provider {
    /**
     * All subscriptions associated to the notification.
     */
    abstract subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    schema: T;

    /**
     * Service client.
     */
    client: Client<T>;
  }

  /**
   * Imported notification service.
   */
  export declare abstract class Import<T extends Service<any>> implements Service.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * All subscriptions attached to the imported notification.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported notification reference.
     */
    reference: T;

    /**
     * Imported message schema (do not replace).
     */
    schema: T['schema'];

    /**
     * Imported service client (do not replace).
     */
    client: T['client'];
  }
}
