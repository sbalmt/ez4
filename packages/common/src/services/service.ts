import type { ServiceWatcherEvent, ServiceWatcherRequest } from './common.js';

export namespace Service {
  export type WatcherEvent<T extends ServiceWatcherRequest> = ServiceWatcherEvent<T>;

  /**
   * Incoming watcher event.
   */
  export type Watcher<T extends ServiceWatcherRequest> = (
    event: WatcherEvent<T>,
    context: Context<any>
  ) => Promise<void> | void;

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

  /**
   * Produces a context for the given service provider `T`.
   */
  export type Context<T> = {
    [P in keyof ServiceList<T>]: ServiceList<T>[P] extends { client: infer U } ? U : never;
  };

  /**
   * Given a service provider `T`, it returns all its provided service clients.
   */
  type ServiceList<T> = T extends { services: infer U } ? U : never;
}
