import type { Database, Index, Client } from '@ez4/database';
import type { PostgresEngine } from '@ez4/aws-aurora/client';
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
  engine: PostgresEngine;

  /**
   * Database scalability.
   * (When `minCapacity` is zero, the auto-pause is activate)
   */
  scalability: {
    minCapacity: 0;
    maxCapacity: 2;
  };

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
