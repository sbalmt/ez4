import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

/**
 * Provide all contracts for a self-managed CDN service.
 */
export namespace Cdn {
  /**
   * Bucket origin.
   */
  export interface BucketOrigin {
    /**
     * Bucket service for the origin.
     */
    bucket: Bucket.Service;

    /**
     * Specify the origin path.
     */
    path?: string;
  }

  /**
   * CDN service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Default origin for the distribution.
     */
    defaultOrigin: BucketOrigin;

    /**
     * Specify the default distribution index (e.g. `index.html`).
     */
    defaultIndex?: string;

    /**
     * Determines whether or not the distribution response is compressed.
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
