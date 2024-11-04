import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

export const enum RecordType {
  A = 'a',
  B = 'b'
}

/**
 * Table schema example.
 */
export declare class TableSchema implements Database.Schema {
  /**
   * Example of a numeric property.
   */
  id: number;

  /**
   * Example of a text property.
   */
  content: string;

  /**
   * Example of a flag property
   */
  enabled: boolean;

  /**
   * Example of an enum property.
   */
  record_type: RecordType;

  /**
   * Example of a rich-type property.
   */
  created_at: String.DateTime;
}
