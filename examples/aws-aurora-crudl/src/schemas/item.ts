import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

export const enum ItemTagType {
  Regular = 'regular',
  Hidden = 'hidden'
}

export type ItemTag = {
  /**
   * Item tag label.
   */
  label: string;

  /**
   * Item tag type.
   */
  type: ItemTagType;
};

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
   * Item order.
   */
  order?: number;

  /**
   * Item category.
   */
  category_id?: String.UUID;

  /**
   * Tags associated to the item.
   * (This is stored as JSONB).
   */
  tags?: ItemTag[];

  /**
   * Item creation date.
   */
  created_at: String.DateTime;

  /**
   * Item last update date.
   */
  updated_at: String.DateTime;
}
