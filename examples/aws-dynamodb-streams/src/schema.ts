import type { Database } from '@ez4/database';

/**
 * Table schema example.
 */
export declare class ExampleSchema implements Database.Schema {
  /**
   * Example of identifier property.
   */
  id: string;

  /**
   * Example of time-to-live property.
   */
  expire_at: number;
}
