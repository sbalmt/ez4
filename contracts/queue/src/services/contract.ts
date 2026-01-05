import type { LinkedVariables } from '@ez4/project/library';
import type { Service as CommonService } from '@ez4/common';
import type { QueueSubscriptionListener } from './listener';
import type { QueueSubscriptionHandler } from './handler';
import type { QueueSubscription } from './subscription';
import type { QueueDeadLetter } from './deadletter';
import type { QueueIncoming } from './incoming';
import type { QueueRequest } from './request';
import type { QueueMessage } from './message';
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
    abstract readonly subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    readonly schema: T;

    /**
     * Enable and configure the FIFO mode options.
     */
    readonly fifoMode?: FifoMode<T>;

    /**
     * Enable and configure the dead-letter queue options.
     */
    readonly deadLetter?: DeadLetter;

    /**
     * Maximum acknowledge time (in seconds) for the handler.
     */
    readonly timeout?: number;

    /**
     * Maximum retention time (in minutes) for all messages in the queue.
     */
    readonly retention?: number;

    /**
     * Maximum wait time (in seconds) for receiving messages.
     */
    readonly polling?: number;

    /**
     * Maximum delay (in seconds) to make messages available.
     */
    readonly delay?: number;

    /**
     * Variables associated to all subscriptions.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service client.
     */
    readonly client: Client<Service<T>>;
  }

  /**
   * Imported queue service.
   */
  export declare abstract class Import<T extends Service<any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract readonly project: string;

    /**
     * Imported queue reference.
     */
    readonly reference: T;

    /**
     * All subscriptions attached to the imported queue.
     */
    readonly subscriptions: Subscription<T['schema']>[];

    /**
     * Imported message schema (do not replace).
     */
    readonly schema: T['schema'];

    /**
     * Imported FIFO mode options (do not replace).
     */
    readonly fifoMode: T['fifoMode'];

    /**
     * Imported maximum acknowledge time (do not replace).
     */
    readonly timeout: T['timeout'];

    /**
     * Imported service client (do not replace).
     */
    readonly client: T['client'];
  }
}
