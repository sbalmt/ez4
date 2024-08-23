import type { Database } from '@ez4/database';

/**
 * Table schema example.
 */
export declare class TableSchema implements Database.Schema {
  /**
   * Example of numeric property.
   */
  id: number;

  /**
   * Example of text property.
   */
  content: string;

  /**
   * Example of flag property
   */
  enabled: boolean;
}
