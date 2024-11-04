import type { Database } from '@ez4/database';
import { String } from '@ez4/schema';

export const enum ItemType {
  TypeA = 'type-a',
  TypeB = 'type-b'
}

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
   * Item type.
   */
  type: ItemType;

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
