import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

/**
 * Categories table schema.
 */
export declare class CategorySchema implements Database.Schema {
  /**
   * Category Id.
   */
  id: String.UUID;

  /**
   * Category name.
   */
  name: String.Size<1, 32>;

  /**
   * Category description.
   */
  description?: String.Size<1, 128>;
}
