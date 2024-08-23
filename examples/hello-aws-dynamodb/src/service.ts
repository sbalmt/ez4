import type { Database, Index } from '@ez4/database';
import type { TableSchema } from './types.js';

/**
 * Example of AWS DynamoDB deployed with EZ4.
 */
export declare class DbExample extends Database.Service<[TableSchema]> {
  tables: [
    {
      name: 'table';
      schema: TableSchema;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
