import type { LinkedVariables } from '@ez4/project/library';
import type { Service as CommonService } from '@ez4/common';
import type { QueueSubscriptionListener } from './listener';
import type { QueueSubscriptionHandler } from './handler';
import type { QueueSubscription } from './subscription';
import type { QueueDeadLetter } from './deadletter';
import type { QueueFifoMode } from './fifomode';
import type { QueueFairMode } from './fairmode';
import type { QueueIncoming } from './incoming';
import type { QueueBackoff } from './backoff';
import type { QueueRequest } from './request';
import type { QueueMessage } from './message';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed queue service.
 */
export namespace Queue {
  export type Message = QueueMessage;
  export type Request = QueueRequest;

  export type DeadLetter = QueueDeadLetter;
  export type Backoff = QueueBackoff;

  export type FifoMode<T extends Message> = QueueFifoMode<T>;
  export type FairMode<T extends Message> = QueueFairMode<T>;

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
   * Queue FIFO mode definition.
   */
  export type UseFifoMode<T extends FifoMode<any>> = T;

  /**
   * Queue Fair mode definition.
   */
  export type UseFairMode<T extends FairMode<any>> = T;

  /**
   * Queue Dead letter definition.
   */
  export type UseDeadLetter<T extends DeadLetter> = T;

  /**
   * Queue Backoff definition.
   */
  export type UseBackoff<T extends Backoff> = T;

  /**
   * Queue service mode.
   */
  export type Mode = { fifoMode: true } | { fairMode: true };

  /**
   * Queue service.
   */
  export declare abstract class Service<T extends Message, U extends Mode> implements CommonService.Provider {
    /**
     * All subscriptions associated to the queue.
     */
    abstract readonly subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    readonly schema: T;

    /**
     * FIFO mode options.
     */
    readonly fifoMode: U extends { fifoMode: true } ? FifoMode<T> : never;

    /**
     * Fair mode options.
     */
    readonly fairMode: U extends { fairMode: true } ? FairMode<T> : never;

    /**
     * Enable and configure the dead-letter queue.
     */
    readonly deadLetter?: DeadLetter;

    /**
     * Enable and configure the backoff options.
     */
    readonly backoff?: Backoff;

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
    readonly client: Client<T, U>;
  }

  /**
   * Ordered queue service.
   */
  export declare abstract class Ordered<T extends Message> extends Service<T, { fifoMode: true }> {
    /**
     * Configure the FIFO mode options.
     */
    abstract readonly fifoMode: FifoMode<T>;

    /**
     * Message schema.
     */
    readonly schema: T;
  }

  /**
   * Unordered queue service.
   */
  export declare abstract class Unordered<T extends Message> extends Service<T, { fairMode: true }> {
    /**
     * Message schema.
     */
    readonly schema: T;
  }

  /**
   * Imported queue service.
   */
  export declare abstract class Import<T extends Service<any, any>> implements CommonService.Provider {
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
     * Imported dead-letter configuration options.
     */
    readonly deadLetter: T['deadLetter'];

    /**
     * Imported backoff configuration options.
     */
    readonly backoff: T['backoff'];

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
