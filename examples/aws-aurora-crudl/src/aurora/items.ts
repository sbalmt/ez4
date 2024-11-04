import type { Database } from '@ez4/database';
import { String } from '@ez4/schema';

/**
 * Items table schema.
 */
export declare class ItemSchema implements Database.Schema {
  /**
   * Item Id.
   */
  id: String.UUID;

  /**
   * Item name.
   */
  name: string;

  /**
   * Item description.
   */
  description?: string;

  /**
   * Item creation date.
   */
  created_at: String.DateTime;

  /**
   * Item last update date.
   */
  updated_at: String.DateTime;
}
