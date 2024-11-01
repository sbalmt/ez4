import type { Database, Index, Client } from '@ez4/database';
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
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
