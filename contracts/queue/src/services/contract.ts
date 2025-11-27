import type { Service as CommonService } from '@ez4/common';
import type { QueueMessage, QueueRequest, QueueIncoming, QueueSubscriptionHandler, QueueSubscriptionListener } from './common';
import type { QueueSubscription } from './subscription';
import type { QueueDeadLetter } from './deadletter';
import type { QueueFifoMode } from './mode';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed queue service.
 */
export namespace Queue {
  export type Message = QueueMessage;
  export type Request = QueueRequest;
  export type DeadLetter = QueueDeadLetter;

  export type FifoMode<T extends Message> = QueueFifoMode<T>;
  export type Incoming<T extends Message> = QueueIncoming<T>;

  export type Listener<T extends Message> = QueueSubscriptionListener<T>;
  export type Handler<T extends Message> = QueueSubscriptionHandler<T>;

  export type Subscription<T extends Message> = QueueSubscription<T>;

  export type ServiceEvent<T extends Message = Message> =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming<T>>
    | CommonService.DoneEvent<Incoming<T>>
    | CommonService.ErrorEvent<Request | Incoming<T>>
    | CommonService.EndEvent<Request>;

  /**
   * Queue Subscription definition.
   */
  export type UseSubscription<T extends Subscription<any>> = T;

  /**
   * Queue Fifo Mode definition.
   */
  export type UseFifoMode<T extends FifoMode<any>> = T;

  /**
   * Queue Dead-letter definition.
   */
  export type UseDeadLetter<T extends DeadLetter> = T;

  /**
   * Queue service.
   */
  export declare abstract class Service<T extends Message> implements CommonService.Provider {
    /**
     * All subscriptions associated to the queue.
     */
    abstract subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    schema: T;

    /**
     * Enable and configure the FIFO mode options.
     */
    fifoMode?: FifoMode<T>;

    /**
     * Enable and configure the dead-letter queue options.
     */
    deadLetter?: DeadLetter;

    /**
     * Maximum acknowledge time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Maximum retention time (in minutes) for all messages in the queue.
     */
    retention?: number;

    /**
     * Maximum wait time (in seconds) for receiving messages.
     */
    polling?: number;

    /**
     * Maximum delay time (in seconds) for making messages available.
     */
    delay?: number;

    /**
     * Service client.
     */
    client: Client<Service<T>>;
  }

  /**
   * Imported queue service.
   */
  export declare abstract class Import<T extends Service<any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * Imported queue reference.
     */
    reference: T;

    /**
     * All subscriptions attached to the imported queue.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported message schema (do not replace).
     */
    schema: T['schema'];

    /**
     * Imported FIFO mode options (do not replace).
     */
    fifoMode: T['fifoMode'];

    /**
     * Imported maximum acknowledge time (do not replace).
     */
    timeout: T['timeout'];

    /**
     * Imported service client (do not replace).
     */
    client: T['client'];
  }
}
