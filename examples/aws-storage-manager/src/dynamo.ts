import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index, Client } from '@ez4/database';
import type { FileSchema } from '@/schemas/file';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class FileDb extends Database.Service {
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
      name: 'files';
      schema: FileSchema;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
