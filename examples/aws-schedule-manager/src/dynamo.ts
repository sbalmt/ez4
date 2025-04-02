import type { Database, Index, Client, TransactionType } from '@ez4/database';
import type { EventSchema } from './schemas/event.js';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class EventDb extends Database.Service {
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
      name: 'events';
      schema: EventSchema;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
