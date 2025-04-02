import type { Database, Index, Client, TransactionType } from '@ez4/database';
import type { ItemSchema } from './schemas/item.js';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class Db extends Database.Service {
  /**
   * Database client.
   */
  client: Client<typeof this>;

  /**
   * Database engine.
   */
  engine: {
    transaction: TransactionType.Static;
    name: 'dynamodb';
  };

  /**
   * Database tables.
   */
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
