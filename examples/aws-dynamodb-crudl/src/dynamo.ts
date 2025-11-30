import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index, Client } from '@ez4/database';
import type { ItemSchema } from './schemas/item';

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
  engine: DynamoDbEngine;

  /**
   * Database tables.
   */
  tables: [
    Database.UseTable<{
      name: 'items';
      schema: ItemSchema;
      indexes: {
        id: Index.Primary;
        'type:created_at': Index.Secondary;
      };
    }>
  ];
}
