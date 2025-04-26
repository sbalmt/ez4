import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Database, Index } from '@ez4/database';
import type { streamHandler } from './stream.js';
import type { streamListener } from './common.js';
import type { ExampleSchema } from './schema.js';

/**
 * Example of AWS DynamoDB with Stream deployed with EZ4.
 */
export declare class Db extends Database.Service {
  engine: DynamoDbEngine;

  tables: [
    {
      name: 'example';
      schema: ExampleSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }
  ];
}
