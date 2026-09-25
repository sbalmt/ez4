import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Client, Database, Index, StreamChangeType } from '@ez4/database';
import type { Environment } from '@ez4/common';
import type { streamHandler } from './stream';
import type { streamListener } from './listener';
import type { ExampleSchema } from './schema';

/**
 * Example of AWS DynamoDB with Stream deployed with EZ4.
 */
export declare class Db extends Database.Service<DynamoDbEngine> {
  client: Client<typeof this>;

  tables: [
    Database.UseTable<{
      name: 'insert_example';
      schema: ExampleSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        triggers: [StreamChangeType.Insert];
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }>,
    Database.UseTable<{
      name: 'update_example';
      schema: ExampleSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        triggers: [StreamChangeType.Update];
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }>,
    Database.UseTable<{
      name: 'delete_example';
      schema: ExampleSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        triggers: [StreamChangeType.Delete];
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }>,
    Database.UseTable<{
      name: 'both_example';
      schema: ExampleSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        triggers: [StreamChangeType.Update, StreamChangeType.Delete];
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }>,
    Database.UseTable<{
      name: 'any_example';
      schema: ExampleSchema;
      indexes: {
        id: Index.Primary;
        expire_at: Index.TTL;
      };
      stream: {
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }>
  ];

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<Db>;
  };
}
