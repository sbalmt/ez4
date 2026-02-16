import type { Service as CommonService } from '@ez4/common';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed email service.
 */
export namespace Email {
  /**
   * Email service.
   */
  export declare abstract class Service implements CommonService.Provider {
    /**
     * Domain to setup the email identity.
     */
    abstract readonly domain: string;

    /**
     * Service client.
     */
    readonly client: Client;
  }
}
