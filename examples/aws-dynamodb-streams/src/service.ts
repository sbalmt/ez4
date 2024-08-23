import type { Database, Index } from '@ez4/database';
import type { streamHandler } from './stream.js';
import type { TableSchema } from './schema.js';

/**
 * Example of AWS DynamoDB with Stream deployed with EZ4.
 */
export declare class DbStreamExample extends Database.Service<[TableSchema]> {
  tables: [
    {
      name: 'stream';
      schema: TableSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        handler: typeof streamHandler;
      };
    }
  ];
}
