import type { Database, Index, TransactionType } from '@ez4/database';
import type { TableSchema } from './types.js';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class Db extends Database.Service {
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
      name: 'table';
      schema: TableSchema;
      indexes: {
        id: Index.Primary; // Partition key only
        'enum:date': Index.Secondary; // Partition and Sort key
      };
    }
  ];
}
