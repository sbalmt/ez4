import type { Database, StreamAnyChange } from '@ez4/database';
import type { Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service<TestEngine> {
  tables: [
    Database.UseTable<{
      name: 'table';
      schema: TestSchema;
      indexes: {};
      stream: { handler: typeof handler };
    }>
  ];
}

async function handler(_change: StreamAnyChange<TestSchema>, {}: Service.Context<TestDatabase>) {}
