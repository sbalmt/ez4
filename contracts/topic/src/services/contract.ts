import type { Service as CommonService } from '@ez4/common';
import type { Exclusive } from '@ez4/utils';
import type { TopicMessage, TopicRequest, TopicIncoming, TopicSubscriptionHandler, TopicSubscriptionListener } from './common';
import type { TopicLambdaSubscription, TopicQueueSubscription } from './subscription';
import type { TopicFifoMode } from './mode';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed topic service.
 */
export namespace Topic {
  export type Message = TopicMessage;
  export type Request = TopicRequest;

  export type FifoMode<T extends Message> = TopicFifoMode<T>;

  export type Incoming<T extends Message> = TopicIncoming<T>;

  export type Listener<T extends Message> = TopicSubscriptionListener<T>;
  export type Handler<T extends Message> = TopicSubscriptionHandler<T>;

  export type LambdaSubscription<T extends Message> = TopicLambdaSubscription<T>;
  export type QueueSubscription<T extends Message> = TopicQueueSubscription<T>;

  export type Subscription<T extends Message> = LambdaSubscription<T> | QueueSubscription<T>;

  export type ServiceEvent<T extends Message = Message> =
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
   * Queue Fifo Mode definition.
   */
  export type UseFifoMode<T extends FifoMode<any>> = T;

  /**
   * Topic service.
   */
  export declare abstract class Service<T extends Message> implements CommonService.Provider {
    /**
     * All subscriptions associated to the topic.
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
     * Service client.
     */
    client: Client<T>;
  }

  /**
   * Imported topic service.
   */
  export declare abstract class Import<T extends Service<any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * All subscriptions attached to the imported topic.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported topic reference.
     */
    reference: T;

    /**
     * Imported message schema (do not replace).
     */
    schema: T['schema'];

    /**
     * Imported FIFO mode options (do not replace).
     */
    fifoMode: T['fifoMode'];

    /**
     * Imported service client (do not replace).
     */
    client: T['client'];
  }
}
