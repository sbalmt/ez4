import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index, Client } from '@ez4/database';
import type { FileSchema } from '@/schemas/file';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class FileDb extends Database.Service<DynamoDbEngine> {
  /**
   * Database client.
   */
  client: Client<typeof this>;

  /**
   * Database tables.
   */
  tables: [
    Database.UseTable<{
      name: 'files';
      schema: FileSchema;
      indexes: {
        id: Index.Primary;
      };
    }>
  ];
}
