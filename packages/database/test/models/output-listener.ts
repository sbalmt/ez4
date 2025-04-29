import type { StreamChange, Database, Client, TransactionType, ParametersType } from '@ez4/database';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    parameters: ParametersType.OnlyIndex;
    transaction: TransactionType.Static;
    name: 'test';
  };

  tables: [
    {
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }
  ];

  client: Client<TestDatabase>;
}

export async function streamListener() {}

export async function streamHandler(_change: StreamChange<TestSchema>) {}
