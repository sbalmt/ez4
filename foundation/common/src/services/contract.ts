import type { ServiceAnyEvent, ServiceBeginEvent, ServiceEndEvent, ServiceErrorEvent, ServiceReadyEvent, ServiceRequest } from './common';
import type { ServiceContext } from '../richtypes/service';

export namespace Service {
  export type AnyEvent<T extends ServiceRequest> = ServiceAnyEvent<T>;
  export type BeginEvent<T extends ServiceRequest> = ServiceBeginEvent<T>;
  export type ReadyEvent<T extends ServiceRequest> = ServiceReadyEvent<T>;
  export type ErrorEvent<T extends ServiceRequest> = ServiceErrorEvent<T>;
  export type EndEvent<T extends ServiceRequest> = ServiceEndEvent<T>;

  /**
   * Service events listener.
   */
  export type Listener<T extends ServiceRequest> = (event: AnyEvent<T>, context: Context<any>) => Promise<void> | void;

  /**
   * Produces a context for the given service provider `T`.
   */
  export type Context<T> = ServiceContext<T>;

  /**
   * Common interface for service providers.
   */
  export interface Provider {
    /**
     * All services associated to the provider.
     */
    services?: Record<string, unknown>;

    /**
     * Service client provided.
     */
    client: unknown;
  }
}
