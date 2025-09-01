import type { PostgresEngine } from '@ez4/aws-aurora/client';
import type { Database, Index } from '@ez4/database';
import type { TableSchema } from './types';

/**
 * Example of AWS Aurora deployed with EZ4.
 */
export declare class Db extends Database.Service {
  /**
   * Database engine.
   */
  engine: PostgresEngine;

  /**
   * Database tables.
   */
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
