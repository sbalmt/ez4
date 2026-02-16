import type { Service as CommonService } from '@ez4/common';
import type { CacheEngine } from './engine';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed cache service.
 */
export namespace Cache {
  export type Engine = CacheEngine;

  /**
   * Cache Engine definition.
   */
  export type UseEngine<T extends CacheEngine> = T;

  /**
   * Cache service.
   */
  export declare abstract class Service implements CommonService.Provider {
    /**
     * Determines which cache engine to use.
     * Check the provider package to know all the possible values.
     */
    abstract readonly engine: Engine;

    /**
     * Service client.
     */
    readonly client: Client;
  }
}
