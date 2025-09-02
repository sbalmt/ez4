import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index } from '@ez4/database';
import type { TableSchema } from './types';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class Db extends Database.Service {
  /**
   * Database engine.
   */
  engine: DynamoDbEngine;

  /**
   * Database tables.
   */
  tables: [
    {
      name: 'table';
      schema: TableSchema;
      indexes: {
        // Partition key
        // Use: 'column_1:column_2' to create a compound partition key.
        id: Index.Primary;

        // Partition and Sort key (Secondary indexes aren't unique).
        // Use: 'column' to create omitting the sort key.
        'enum:date': Index.Secondary;
      };
    }
  ];
}
