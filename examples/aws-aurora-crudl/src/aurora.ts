import type { Database, Index, Client } from '@ez4/database';
import type { CategorySchema } from './schemas/category.js';
import type { ItemSchema } from './schemas/item.js';

/**
 * Example of AWS Aurora RDS deployed with EZ4.
 */
export declare class Db extends Database.Service {
  client: Client<typeof this>;

  engine: 'aurora';

  tables: [
    {
      name: 'items';
      schema: ItemSchema;
      relations: {
        'categories:id': 'category_id@category';
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
        'items:category_id': 'id@items';
      };
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
