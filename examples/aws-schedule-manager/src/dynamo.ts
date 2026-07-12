import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index, Client } from '@ez4/database';
import type { EventSchema } from '@/schemas/event';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class EventDb extends Database.Service<DynamoDbEngine> {
  /**
   * Database client.
   */
  client: Client<typeof this>;

  /**
   * Database tables.
   */
  tables: [
    Database.UseTable<{
      name: 'events';
      schema: EventSchema;
      indexes: {
        id: Index.Primary;
      };
    }>
  ];
}
