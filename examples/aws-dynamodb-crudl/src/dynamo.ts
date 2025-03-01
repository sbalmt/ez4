import type { Database, Index, Client } from '@ez4/database';
import type { ItemSchema } from './schemas/item.js';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class Db extends Database.Service {
  client: Client<typeof this>;

  engine: 'dynamodb';

  tables: [
    {
      name: 'items';
      schema: ItemSchema;
      indexes: {
        id: Index.Primary;
        'type:created_at': Index.Secondary;
      };
    }
  ];
}
