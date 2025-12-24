import type { Service as RichService } from '../richtypes/service';
import type { ServiceAnyEvent, ServiceBeginEvent, ServiceDoneEvent, ServiceEndEvent, ServiceErrorEvent, ServiceReadyEvent } from './event';
import type { ServiceRequest } from './request';

export namespace Service {
  export type AnyEvent<T extends ServiceRequest> = ServiceAnyEvent<T>;
  export type BeginEvent<T extends ServiceRequest> = ServiceBeginEvent<T>;
  export type ReadyEvent<T extends ServiceRequest> = ServiceReadyEvent<T>;
  export type DoneEvent<T extends ServiceRequest> = ServiceDoneEvent<T>;
  export type ErrorEvent<T extends ServiceRequest> = ServiceErrorEvent<T>;
  export type EndEvent<T extends ServiceRequest> = ServiceEndEvent<T>;

  /**
   * Function to listen to the service events.
   */
  export type Listener<T extends ServiceRequest> = (event: AnyEvent<T>, context: Context<any>) => Promise<void> | void;

  /**
   * Produces a context for the given service provider `T`.
   */
  export type Context<T> = RichService.Context<T>;

  /**
   * Common interface for service providers.
   */
  export interface Provider {
    /**
     * All services associated to the provider.
     */
    readonly services?: Record<string, unknown>;

    /**
     * Service client provided.
     */
    readonly client: unknown;
  }
}
