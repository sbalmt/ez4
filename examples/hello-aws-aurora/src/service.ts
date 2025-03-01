import type { Database, Index } from '@ez4/database';
import type { TableSchema } from './types.js';

/**
 * Example of AWS Aurora deployed with EZ4.
 */
export declare class Db extends Database.Service {
  engine: 'aurora';

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
