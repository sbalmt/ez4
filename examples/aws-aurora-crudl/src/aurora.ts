import type { Database, Index, Client } from '@ez4/database';
import type { CategorySchema } from './aurora/category.js';
import type { ItemSchema } from './aurora/items.js';

/**
 * Example of AWS Aurora RDS deployed with EZ4.
 */
export declare class Db extends Database.Service<[ItemSchema]> {
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
