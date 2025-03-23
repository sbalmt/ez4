import type { Database, Index, Client } from '@ez4/database';
import type { CategorySchema } from './schemas/category.js';
import type { ItemSchema } from './schemas/item.js';

/**
 * Example of AWS Aurora RDS deployed with EZ4.
 */
export declare class Db extends Database.Service {
  /**
   * Database client.
   */
  client: Client<typeof this>;

  /**
   * Database engine.
   */
  engine: 'aurora';

  /**
   * Database tables.
   */
  tables: [
    {
      name: 'items';
      schema: ItemSchema;
      relations: {
        'category_id@category': 'categories:id';
      };
      indexes: {
        id: Index.Primary;
        created_at: Index.Secondary;
      };
    },
    {
      name: 'categories';
      schema: CategorySchema;
      relations: {
        'id@items': 'items:category_id';
      };
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
