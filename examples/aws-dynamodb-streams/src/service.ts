import type { Database, Index } from '@ez4/database';
import type { streamHandler } from './stream.js';
import type { ExampleSchema } from './schema.js';

/**
 * Example of AWS DynamoDB with Stream deployed with EZ4.
 */
export declare class Db extends Database.Service<[ExampleSchema]> {
  engine: 'dynamodb';

  tables: [
    {
      name: 'example';
      schema: ExampleSchema;
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
