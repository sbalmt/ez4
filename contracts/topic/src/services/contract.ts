import type { LinkedVariables } from '@ez4/project/library';
import type { Service as CommonService } from '@ez4/common';
import type { Exclusive } from '@ez4/utils';
import type { TopicLambdaSubscription, TopicQueueSubscription } from './subscription';
import type { TopicSubscriptionListener } from './listener';
import type { TopicSubscriptionHandler } from './handler';
import type { TopicIncoming } from './incoming';
import type { TopicRequest } from './request';
import type { TopicFifoMode } from './mode';
import type { TopicEvent } from './event';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed topic service.
 */
export namespace Topic {
  export type Event = TopicEvent;
  export type Request = TopicRequest;

  export type FifoMode<T extends Event> = TopicFifoMode<T>;

  export type Incoming<T extends Event> = TopicIncoming<T>;

  export type Listener<T extends Event> = TopicSubscriptionListener<T>;
  export type Handler<T extends Event> = TopicSubscriptionHandler<T>;

  export type LambdaSubscription<T extends Event> = TopicLambdaSubscription<T>;
  export type QueueSubscription<T extends Event> = TopicQueueSubscription<T>;

  export type Subscription<T extends Event> = LambdaSubscription<T> | QueueSubscription<T>;

  export type ServiceEvent<T extends Event = Event> =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming<T>>
    | CommonService.DoneEvent<Incoming<T>>
    | CommonService.ErrorEvent<Request | Incoming<T>>
    | CommonService.EndEvent<Request>;

  /**
   * Topic Subscription definition.
   */
  export type UseSubscription<T extends Exclusive<LambdaSubscription<any>, QueueSubscription<any>>> = T;

  /**
   * Topic Fifo Mode definition.
   */
  export type UseFifoMode<T extends FifoMode<any>> = T;

  /**
   * Topic service.
   */
  export declare abstract class Service<T extends Event, U extends FifoMode<T> | undefined = undefined> implements CommonService.Provider {
    /**
     * All subscriptions associated to the topic.
     */
    abstract readonly subscriptions: Subscription<T>[];

    /**
     * Event schema.
     */
    readonly schema: T;

    /**
     * FIFO mode options.
     */
    readonly fifoMode: U;

    /**
     * Variables associated to all subscriptions.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service client.
     */
    readonly client: Client<T>;

    /**
     * No service options available.
     */
    readonly options: never;
  }

  /**
   * Ordered queue service.
   */
  export declare abstract class Ordered<T extends Event> extends Service<T, FifoMode<T>> {
    /**
     * Configure the FIFO mode options.
     */
    abstract readonly fifoMode: FifoMode<T>;

    /**
     * Event schema.
     */
    readonly schema: T;
  }

  /**
   * Unordered queue service.
   */
  export declare abstract class Unordered<T extends Event> extends Service<T, undefined> {
    /**
     * Event schema.
     */
    readonly schema: T;
  }

  /**
   * Imported topic service.
   */
  export declare abstract class Import<T extends Service<any, any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract readonly project: string;

    /**
     * All subscriptions attached to the imported topic.
     */
    readonly subscriptions: Subscription<T['schema']>[];

    /**
     * Imported topic reference.
     */
    readonly reference: T;

    /**
     * Imported event schema (do not replace).
     */
    readonly schema: T['schema'];

    /**
     * Imported FIFO mode options (do not replace).
     */
    readonly fifoMode: T['fifoMode'];

    /**
     * Imported service client (do not replace).
     */
    readonly client: T['client'];

    /**
     * No service options available.
     */
    readonly options: never;
  }
}
