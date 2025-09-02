import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Client, Database, Index } from '@ez4/database';
import type { Environment } from '@ez4/common';
import type { streamHandler } from './stream';
import type { streamListener } from './common';
import type { ExampleSchema } from './schema';

/**
 * Example of AWS DynamoDB with Stream deployed with EZ4.
 */
export declare class Db extends Database.Service {
  client: Client<typeof this>;

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

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<Db>;
  };
}
