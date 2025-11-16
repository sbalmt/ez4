import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index, Client } from '@ez4/database';
import type { EventSchema } from '@/schemas/event';

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
  engine: DynamoDbEngine;

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
