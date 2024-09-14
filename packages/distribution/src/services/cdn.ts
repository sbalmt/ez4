import type { Service } from '@ez4/common';

/**
 * Provide all contracts for a self-managed CDN service.
 */
export namespace Cdn {
  /**
   * CDN service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Specify the default distribution index (e.g. `index.html`).
     */
    defaultIndex?: string;

    /**
     * Determines whether or not compression is enabled for the distribution.
     */
    compress?: boolean;

    /**
     * Determines whether or not the distribution is disabled.
     */
    disabled?: boolean;

    /**
     * Service client.
     */
    client: never;
  }
}
